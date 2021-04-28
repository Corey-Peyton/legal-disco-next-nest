import { AppStore } from '@/app-store';
import Toolbar from '@/components/toolbar.vue';
import TreeSelect from '@/components/tree-select.vue';
import { HorizontalDirection, VerticalDirection } from '@/enums/direction';
import { DrawObject } from '@/enums/draw-object';
import { FieldType } from '@/enums/field-type';
import { Canvas } from '@/extended-types/canvas';
import { FabricObject } from '@/extended-types/fabric-object';
import { KeyValue } from '@/models/key-value';
import { ObjectProperty } from '@/models/object-property';
import { ApiService } from '@/services/api-service';
import {
    Checkbox, Collapse, CollapseItem, ColorPicker, Dropdown, DropdownItem, DropdownMenu,
    Form, FormItem, Input, InputNumber, Option, Popover, Radio, RadioGroup, Select, TabPane, Tabs
} from 'element-ui';
import { fabric } from 'fabric';
import Vue from 'vue';
import { Drop } from 'vue-drag-drop';
import { Component, Prop, Watch } from 'vue-property-decorator';

declare global {
    interface Window {
        annotatorGlobal: Annotator;
        nodeImageAnnotatorSave: any;
        projectId: number;
    }
}

@Component({
    components: {
        Checkbox, ColorPicker, Collapse, CollapseItem, Dropdown, DropdownItem, DropdownMenu,
        ElForm: Form, FormItem, ElInput: Input, InputNumber, ElOption: Option, Popover, Radio,
        RadioGroup, ElSelect: Select, TabPane, Tabs, Toolbar, TreeSelect, Drop,
    },
})
export default class Annotator extends Vue {
    private get rootDivWidth(): number {
        return (this.$refs.rootDiv as HTMLDivElement).clientWidth;
    }

    @Prop()
    annotationId?: number;

    @Prop()
    annotations: any;
    // This array needs to be maintained along with annotatorData
    canvasData: Array<{ id: number }> = [{ id: -1 }];

    @Prop()
    documentId?: number;
    drawObject = DrawObject;
    fieldType = FieldType;

    horizontalDirection = HorizontalDirection;
    objectProperties: Array<{ label: string; prop: string; type: FieldType; value: any }> = [];
    propertyPopoverVisible = false;
    verticalDirection = VerticalDirection;
    private activeDrawObject?: fabric.Object | null = null;
    private activeSelectedObject?: FabricObject | null = new FabricObject();
    private angle = 0;
    private annotatorData: Canvas[] = [];
    private readonly defaultFontSize = 14;
    private lazySaveTimeout?: number;
    private scaleXY = 1; // TODO: We will use this later.
    // Standard letter size -> https://www.belightsoft.com/products/resources/paper-sizes-and-formats-explained
    // tslint:disable-next-line: no-magic-numbers
    private readonly standardLetterPageSize = (11 / 8.5);

    private readonly textWidthCanvas = document.createElement('canvas');

    constructor() {
        super();
        window.annotatorGlobal = this;
    }

    downloadPage(canvas: Canvas) {
        window.nodeImageAnnotatorSave({ id: canvas.id, url: canvas.toDataURL() });
    }

    // TODO: on drop previous object gets selected rather than dropped one. need to fix
    handleDrop(data: ObjectProperty, event: DragEvent) {

        // tslint:disable-next-line: no-magic-numbers
        const halfTextWidth = this.getTextWidth(data.label, this.defaultFontSize.toString()) / 2;

        const object = new fabric.Text(data.label, {
            fontSize: this.defaultFontSize,
            fontFamily: 'Avenir, Helvetica, Arial, sans-serif',
            left: event.offsetX - halfTextWidth,
            // tslint:disable-next-line: no-magic-numbers
            top: event.offsetY - (this.defaultFontSize / 2),
            fill: '#000',
        });

        const canvasId = Number((event.target as HTMLInputElement).previousElementSibling!.id);
        const canvas = this.annotatorData.find((item: Canvas) =>
            item.id === canvasId);

        canvas!.add(object);
        canvas!.renderAll();
        canvas!.setActiveObject(object);
    }

    horizontalOffest(): number {

        if (this.activeSelectedObject!.horizontal === null) {
            // TODO: This is not allowing it to change
            this.activeSelectedObject!.horizontal = HorizontalDirection.Left;
        }

        if (this.activeSelectedObject!.horizontal === HorizontalDirection.Left) {
            return this.activeSelectedObject!.left!;
        }

        // Right offset
        return (this.activeSelectedObject!.canvas!.getWidth() -
            (this.activeSelectedObject!.left! + this.activeSelectedObject!.width!));

    }

    /* Mousemove */
    keepDrawing(e: fabric.IEvent, canvas: Canvas) {

        if (!canvas.drawStarted) {
            return false;
        }

        const mouse = canvas.getPointer(e.e);
        const activeObject = canvas.getActiveObject();

        if (canvas.origX > mouse.x) {
            activeObject.set({ left: mouse.x });
        }

        if (canvas.origY > mouse.y) {
            activeObject.set({ top: mouse.y });
        }

        switch (activeObject.get('type')) {
            case 'ellipse':

                (activeObject as fabric.Ellipse).set({
                    // tslint:disable-next-line: no-magic-numbers
                    rx: Math.abs(canvas.origX - mouse.x) / 2,
                    // tslint:disable-next-line: no-magic-numbers
                    ry: Math.abs(canvas.origY - mouse.y) / 2,
                });

                break;
            case 'rect':
            case 'textbox':
                const w = Math.abs(mouse.x - canvas.origX);
                const h = Math.abs(mouse.y - canvas.origY);

                if (!w || !h) {
                    return false;
                }

                activeObject.set({
                    width: w,
                    height: h,
                });
        }
        canvas.renderAll();
    }

    mounted() {
        if (this.documentId === -1) {
            const canvas = Object.assign(new Canvas(this.canvasData[0].id.toString(), { backgroundColor: '#fff' }), {
                id: this.canvasData[0].id,
            });
            this.annotatorData.push(canvas);
            this.setBackgroundImage();
        }

        if (this.annotationId) {
            this.loadAnnotationData();
        }
    }

    objectPropertyChange(data: ObjectProperty) {
        this.activeSelectedObject!.set(data.prop as any, data.value)
            .setCoords();
        this.activeSelectedObject!.canvas!.renderAll();
        if (data.type === FieldType.Text || data.type === FieldType.Number) {
            this.lazySaveObject(this.activeSelectedObject!.canvas as Canvas);
        } else {
            this.saveObject(this.activeSelectedObject!.canvas as Canvas);
        }
    }

    @Watch('annotationId')
    onAnnotationIdChanged() {
        this.loadAnnotationData();
    }

    @Watch('documentId')
    onDocumentIdChanged(documentId: number) {

        ApiService.post('document/PNG', { documentId })
            .then((responseData: any) => {
                this.annotatorData = [];
                this.canvasData = [];
                const fileContentResult = responseData.fileContentResult;

                for (let i = 0; i < responseData.count; i++) {
                    this.canvasData.push({ id: i });
                }

                // Timeout. Because it allows vue to create canvas first, so that fabric can make object over it.
                setTimeout(() => {
                    for (let i = 0; i < responseData.count; i++) {

                        // TODO: Currently only first page is getting loaded. Need to load all.
                        if (i === 0) {
                            this.annotatorData.push(Object.assign(new Canvas(i.toString()), {
                                id: i,
                                imageUrl: `data:${fileContentResult.contentType};base64,${fileContentResult.fileContents}`
                            }));
                        } else {
                            this.annotatorData.push(Object.assign(new Canvas(i.toString()), {
                                id: i,
                                imageUrl: `data:${fileContentResult.contentType};base64,${fileContentResult.fileContents}`
                            }));
                        }
                    }
                    this.setBackgroundImage();
                    this.loadAnnotationData();
                });

            });
    }

    rotate(degrees: number) {
        // tslint:disable-next-line: no-magic-numbers
        this.angle = (this.angle + degrees) % 360;
        this.annotatorData.forEach((canvas: Canvas) => {
            let turnRight = true;
            if (degrees < 0) {
                turnRight = false;
            }

            canvas.getObjects()
                .forEach((obj) => {
                    if (turnRight) {
                        const prevTop = obj.top;
                        obj.top = obj.left;
                        obj.left = (canvas.getHeight() / canvas.getZoom()) - prevTop!;
                    } else {
                        const prevLeft = obj.left;
                        obj.left = obj.top;
                        obj.top = (canvas.getWidth() / canvas.getZoom()) - prevLeft!;
                    }

                    obj.angle! += degrees;
                    obj.setCoords();
                });

            const currentWidth = canvas.getWidth();
            const currentHeight = canvas.getHeight();
            canvas.setWidth(currentHeight);
            canvas.setHeight(currentWidth);
            const bgImg = canvas.backgroundImage as fabric.Image;
            bgImg.angle = this.angle;

            // tslint:disable-next-line: no-magic-numbers
            if (this.angle % 180 !== 0) {
                // tslint:disable-next-line: no-magic-numbers
                const left = (bgImg.height! * bgImg.scaleY!) / 2;
                // tslint:disable-next-line: no-magic-numbers
                const top = (bgImg.width! * bgImg.scaleX!) / 2;
                bgImg.set({ left, top });
            } else {
                // tslint:disable-next-line: no-magic-numbers
                const left = (bgImg.width! * bgImg.scaleX!) / 2;
                // tslint:disable-next-line: no-magic-numbers
                const top = (bgImg.height! * bgImg.scaleY!) / 2;
                bgImg.set({ left, top });
            }
        });
    }

    saveObjects(annotationId: number) {
        this.saveObject(this.annotatorData[0], annotationId);
    }

    setBackgroundImage() {
        this.annotatorData.forEach((canvas: Canvas, index: number) => {
            // Create a wrapper around native canvas element (with id="c")

            // tslint:disable-next-line: max-line-length
            // TODO: Need to check if we can get canvas object from event itself. So that we don't need to pass canvas parameter.
            canvas.on('mouse:down', (e) => {
                this.startDrawing(e, canvas);
            });
            canvas.on('mouse:move', (e) => {
                this.keepDrawing(e, canvas);
            });
            canvas.on('mouse:up', (e) => {
                this.stopDrawing(e, canvas);
            });
            canvas.on('selection:created', (e) => {
                this.showProperty(e);
            });
            canvas.on('selection:cleared', (e) => {
                this.hideProperty(e);
            });
            canvas.on('object:modified', (e) => {
                this.saveObject(canvas);
            });

            if (canvas.id === -1) {
                this.fitToWidth(canvas, this.standardLetterPageSize);
            } else {

                const bgImg = new fabric.Image();
                bgImg.setSrc(canvas.imageUrl, () => {

                    const ratio = bgImg.height! / bgImg.width!;
                    this.fitToWidth(canvas, ratio);
                    // We will always calculate scale based on width as we are maintaining aspect ratio always.
                    this.scaleXY = canvas.getWidth() / bgImg.width!;

                    bgImg.set({
                        top: 0,
                        left: 0,
                        scaleX: 1,
                        scaleY: 1,
                        originX: 'center',
                        originY: 'center',
                    });
                    bgImg.scaleToWidth(canvas.getWidth());
                    bgImg.set({
                        // tslint:disable-next-line: no-magic-numbers
                        left: (bgImg.width! * bgImg.scaleX!) / 2,
                        // tslint:disable-next-line: no-magic-numbers
                        top: (bgImg.height! * bgImg.scaleY!) / 2,
                    });
                    canvas.setBackgroundImage(bgImg, canvas.renderAll.bind(canvas));
                });
            }
        });
    }

    setDrawObject(drawObject: DrawObject) {
        switch (drawObject) {
            case DrawObject.Ellipse:
                this.activeDrawObject = new fabric.Ellipse();
                break;
            case DrawObject.Rect:
                this.activeDrawObject = new fabric.Rect();
                break;
            case DrawObject.TextBox:
                this.activeDrawObject = new fabric.Textbox('Enter your text');
        }
    }

    setZoom(scale: number) {

        this.annotatorData.forEach((canvas: Canvas) => {
            canvas.setHeight(canvas.getHeight() * scale);
            canvas.setWidth(canvas.getWidth() * scale);
            canvas.setZoom(canvas.getZoom() * scale);
        });
    }

    // Https://stackoverflow.com/questions/9417603/fabric-js-free-draw-a-rectangle
    /* Mousedown */
    startDrawing(e: fabric.IEvent, canvas: Canvas) {

        if (this.activeDrawObject === null) {
            return;
        }

        const mouse = canvas.getPointer(e.e);

        canvas.drawStarted = true;

        this.activeDrawObject!.left = canvas.origX = mouse.x;
        this.activeDrawObject!.top = canvas.origY = mouse.y;

        canvas.add(this.activeDrawObject!);
        canvas.renderAll();
        canvas.setActiveObject(this.activeDrawObject!);
        this.activeDrawObject = null;
    }

    /* Mouseup */
    stopDrawing(e: fabric.IEvent, canvas: Canvas) {
        if (canvas.drawStarted) {
            canvas.getActiveObject()
                .setCoords();
            (canvas as any).drawStarted = false;
            this.saveObject(canvas);
        }
    }

    verticalOffest(): number {

        if (this.activeSelectedObject!.vertical === null) {
            // TODO: This is not allowing it to change
            this.activeSelectedObject!.vertical = VerticalDirection.Top;
        }

        if (this.activeSelectedObject!.vertical === VerticalDirection.Top) {
            return this.activeSelectedObject!.top!;
        }

        // Bottom offset
        return (this.activeSelectedObject!.canvas!.getHeight() -
            (this.activeSelectedObject!.top! + this.activeSelectedObject!.height!));

    }

    private fitToWidth(canvas: Canvas, ratio: number) {
        canvas.setWidth(this.rootDivWidth);
        canvas.setHeight(this.rootDivWidth * ratio);
    }

    private getTextWidth(text: string, font: string) {
        const context = this.textWidthCanvas.getContext('2d');
        context!.font = font;

        return context!.measureText(text).width;
    }

    private hideProperty(e: fabric.IEvent) {
        this.propertyPopoverVisible = false;
    }

    private lazySaveObject(canvas: Canvas) {
        if (this.lazySaveTimeout) {
            clearTimeout(this.lazySaveTimeout);
        }
        this.lazySaveTimeout = window.setTimeout(() => { this.saveObject(canvas); }, AppStore.autoSaveTime);
    }

    private loadAnnotationData() {

        // If only one of them is selected then don't go to fetch
        if (!(this.documentId && this.annotationId)) {

            if (this.documentId && this.annotations) {
                this.annotatorData.forEach((canvasPage) => {
                    canvasPage.loadFromJSON(
                        {
                            objects: this.annotations, background: canvasPage.backgroundColor
                        },
                        () => {
                            const callback = () => {
                                canvasPage.off('after:render', callback);
                                this.downloadPage(canvasPage);
                            };
                            canvasPage.on('after:render', callback);
                            canvasPage.renderAll.bind(canvasPage);
                        });
                });
            }

            return;
        }

        this.annotatorData.forEach((canvas) => {
            canvas.remove(...canvas.getObjects());
        });

        ApiService.post(
            'documentAnnotation/documentAnnotationData', {
            documentId: this.documentId,
            annotationId: this.annotationId,
        })
            .then((responseData: KeyValue[]) => {
                responseData.forEach((annotateData) => {
                    const canvasPage = this.annotatorData.find((canvas) => canvas.id === annotateData.key)!;

                    canvasPage.loadFromJSON(
                        {
                            objects: JSON.parse(annotateData.value), background: canvasPage.backgroundColor
                        },
                        canvasPage.renderAll.bind(canvasPage)
                    );
                });
            });
    }

    private saveObject(canvas: Canvas, annotationId?: number) {
        ApiService.post(
            'documentAnnotation/save', {
            documentId: this.documentId,
            annotationId: this.annotationId || annotationId,
            pageId: this.documentId ? canvas.id : null,
            value: JSON.stringify(canvas.getObjects()),
        });
    }

    private showProperty(e: fabric.IEvent) {
        this.activeSelectedObject = e.target! as FabricObject;
        this.objectProperties = [];

        if (this.activeSelectedObject.type === 'textbox') {
            this.objectProperties.push({
                label: 'Text',
                prop: 'text',
                value: (this.activeSelectedObject as unknown as fabric.Text).text,
                type: FieldType.Text,
            });

            this.objectProperties.push({
                label: 'Text Size',
                prop: 'fontSize',
                value: (this.activeSelectedObject as unknown as fabric.Text).fontSize,
                type: FieldType.Number,
            });

            this.objectProperties.push({
                label: 'Text Background Color',
                prop: 'textBackgroundColor',
                value: (this.activeSelectedObject as unknown as fabric.Text).textBackgroundColor,
                type: FieldType.Color,
            });
        }

        if (this.activeSelectedObject.type === 'ellipse') {
            this.objectProperties.push({
                label: 'Horizontal Radius',
                prop: 'rx',
                value: (this.activeSelectedObject as unknown as fabric.Ellipse).rx,
                type: FieldType.Number,
            });

            this.objectProperties.push({
                label: 'Vertical Radius',
                prop: 'ry',
                value: (this.activeSelectedObject as unknown as fabric.Ellipse).ry,
                type: FieldType.Number,
            });
        }

        this.objectProperties.push({
            label: 'Background Color',
            prop: 'fill',
            value: this.activeSelectedObject.fill,
            type: FieldType.Color,
        });

        this.objectProperties.push({
            label: 'Border Color',
            prop: 'borderColor',
            value: this.activeSelectedObject.borderColor,
            type: FieldType.Color,
        });
        this.activeSelectedObject.horizontalOffset = this.horizontalOffest();
        this.activeSelectedObject.verticalOffset = this.verticalOffest();

        this.propertyPopoverVisible = true;
    }

}
