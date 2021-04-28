import { fabric } from 'fabric';

export class Canvas extends fabric.Canvas {
    drawStarted = false;
    id = 0;
    imageUrl = '';
    origX = 0;
    origY = 0;
}
