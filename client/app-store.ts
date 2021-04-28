import { FieldType } from './enums/field-type';
import { DocFieldsTreeData } from './extended-types/doc-fields-tree-data';
import { TreeData } from './extended-types/tree-data';
import { DocumentAnnotation } from './models/document-annotation';
import { DocumentField } from './models/document-field';
import { NodeType } from './models/node-type';
import { Production } from './models/production';
import { Query } from './models/query';
import { ApiService } from './services/api-service';
import { eventBus } from './services/event-bus';

export class AppStore {

  static autoSaveTime = 750;

  static get annotations(): TreeData {

    if (!AppStore.annotationsLoaded && AppStore.projectId !== null) {
      AppStore.annotationsLoaded = true;

      ApiService.post(
        'documentAnnotation/annotations',
      )
        .then((responseData: DocumentAnnotation[][]) => {
          // TODO: Can't there be a mapper which can transform the results?

          AppStore._annotations.children =
            [
              {
                id: `0.${NodeType.SinglePageAnnotation}`,
                label: 'Single',
                children: AppStore.mapDocumentAnnotations(
                  responseData[0], NodeType.SinglePageAnnotation, false
                ),
                nodeType: NodeType.SinglePageAnnotation,
              },
              {
                id: `0.${NodeType.MultiPageAnnotation}`,
                label: 'Multiple',
                children: AppStore.mapDocumentAnnotations(responseData[1], NodeType.MultiPageAnnotation, false),
                nodeType: NodeType.MultiPageAnnotation,
              }
            ];

          eventBus.$emit('AnnotationsRetrieved');

        });

    }

    return AppStore._annotations;
  }

  static set annotations(value: TreeData) {
    AppStore._annotations = value;
  }

  static beforeAppUnloadHandler() {
    ApiService.post('session/clear');
  }

  static get docFields(): DocFieldsTreeData[] {

    if (!AppStore.docFieldsLoaded && AppStore.projectId !== null) {
      AppStore.docFieldsLoaded = true;

      const documentFieldsPromise = ApiService.post('documentField/getDocumentFields', { parentIds: [null] })
        .then((documentFields: DocumentField[]) => {
          if (documentFields.length) {
            AppStore._docFields.find((x) => x.nodeType === NodeType.DocumentField)!
              .children = AppStore.mapDocumentFields(
                documentFields,
              )!;
          }
        });

      const annotationPromise = ApiService.post(
        'documentAnnotation/annotations',
      )
        .then((responseData: DocumentAnnotation[][]) => {
          // TODO: Can't there be a mapper which can transform the results?

          AppStore._docFields
            .find((x) => x.nodeType === NodeType.Annotation)!.children =
            [
              {
                id: `0.${NodeType.SinglePageAnnotation}`,
                label: 'Single',
                children: AppStore.mapDocumentAnnotations(
                  responseData[0], NodeType.SinglePageAnnotation, true
                ),
                nodeType: NodeType.SinglePageAnnotation,
              },
              {
                id: `0.${NodeType.MultiPageAnnotation}`,
                label: 'Multiple',
                children: AppStore.mapDocumentAnnotations(
                  responseData[1],
                  NodeType.MultiPageAnnotation,
                  true),
                nodeType: NodeType.MultiPageAnnotation,
              }
            ];

        });

      Promise.all([documentFieldsPromise, annotationPromise])
        .then(() => {
          eventBus.$emit('DocumentFieldsRetrieved');
        });

    }

    return AppStore._docFields;
  }

  static set docFields(value: DocFieldsTreeData[]) {
    AppStore._docFields = value;
  }

  // TODO: multiple annotation call need to be optimised
  static mapDocumentAnnotations(
    documentAnnotations: DocumentAnnotation[],
    nodeType: NodeType,
    appendTypeInId: boolean): TreeData[] {
    const children: TreeData[] = [];
    documentAnnotations.map((documentAnnotation) => {
      children.push({
        id: `${(appendTypeInId ? nodeType : '')}${documentAnnotation.id}`,
        label: documentAnnotation.name,
        fieldType: FieldType.Radio,
        nodeType,
        tagInputVisible: false,
        children: AppStore.mapDocumentAnnotations(documentAnnotation.children || [], nodeType, appendTypeInId),
      });
    });

    return children;
  }

  // TODO: make common out of following functions. mapDocumentFields, mapDocumentAnnotations, mapDocumentSearches
  static mapDocumentFields(documentFields: DocumentField[]): TreeData[] | null {
    const children: DocFieldsTreeData[] = [];
    documentFields.map((documentField) => {
      children.push({
        id: `${NodeType.DocumentField}_${documentField.id}`,
        label: documentField.name,
        fieldType: documentField.type,
        nodeType: NodeType.DocumentField,
        tagInputVisible: false,
        value: '',
        children: AppStore.mapDocumentFields(documentField.childDocumentField || [])!,
        checkable: true,
        selectedColumn: false
      });
    });

    return children.length && children || null;
  }

  static mapDocumentSearches(documentSearches: Query[]): TreeData[] | null {
    const children: TreeData[] = [];
    documentSearches.map((documentSearch) => {
      children.push({
        id: documentSearch.id,
        label: documentSearch.name,
        fieldType: FieldType.Radio,
        nodeType: NodeType.Search,
        tagInputVisible: false,
        children: AppStore.mapDocumentSearches(documentSearch.childrenQuery || [])!,
      });
    });

    return (children.length && children) || null;
  }

  static mapProductions(productions: Production[]): TreeData[] {
    const children: TreeData[] = [];
    productions.map((production) => {
      children.push({
        id: `${NodeType.Production}_${production.id}`,
        label: production.name,
        fieldType: FieldType.Radio,
        nodeType: NodeType.Production,
        tagInputVisible: false,
        children: AppStore.mapProductions(production.childrenProduction || []),
      });
    });

    return children;
  }

  static get multiPageannotations(): TreeData {

    if (!AppStore.multiPageAnnotationsLoaded && AppStore.projectId !== null) {
      AppStore.multiPageAnnotationsLoaded = true;

      ApiService.post('documentAnnotation/annotations')
        .then((annotations: DocumentAnnotation[][]) => { // TODO: This change is temporary. to build fix.
          if (annotations.length) {
            AppStore._multiPageAnnotations.children = AppStore.mapDocumentAnnotations(
              annotations[1], NodeType.MultiPageAnnotation, true
            );
          }
        });

    }

    return AppStore._multiPageAnnotations;
  }

  static set multiPageannotations(value: TreeData) {
    AppStore._multiPageAnnotations = value;
  }

  static get productions(): TreeData {

    if (!AppStore.productionsLoaded && AppStore.projectId !== null) {
      AppStore.productionsLoaded = true;

      ApiService.post('production/productions')
        .then((productions: Production[]) => { // TODO: This change is temporary. to build fix.
          if (productions.length) {
            AppStore._productions.children = AppStore.mapProductions(
              productions
            );
          }
        });
    }

    return AppStore._productions;
  }

  static set productions(value: TreeData) {
    AppStore._productions = value;
  }

  static get searches(): TreeData {

    if (!AppStore.searchesLoaded && AppStore.projectId !== null) {
      AppStore.searchesLoaded = true;

      ApiService.post('search/getSearches')
        .then((searches: Query[]) => { // TODO: This change is temporary. to build fix.
          if (searches.length) {
            AppStore._searches.children = AppStore.mapDocumentSearches(
              searches,
            )!;

            eventBus.$emit('SearchesRetrieved');
          }
        });

    }

    return AppStore._searches;
  }

  static set searches(value: TreeData) {
    AppStore._searches = value;
  }

  static projectId = 0;

  static sessionId: number;

  // tslint:disable-next-line: variable-name
  private static _annotations: TreeData = {
    id: `${NodeType.Annotation}_${0}`,
    label: 'Annotations',
    nodeType: NodeType.Annotation,
    children: [],
  };

  // tslint:disable-next-line: variable-name
  private static _docFields: DocFieldsTreeData[] = [
    {
      id: `${NodeType.Annotation}_${0}`,
      label: 'Annotations',
      nodeType: NodeType.Annotation,
      children: [],
    },
    {
      id: `${NodeType.DocumentMetadata}_${0}`,
      label: 'Metadata',
      nodeType: NodeType.DocumentMetadata,
      children: [],
    },
    {
      id: `${NodeType.DocumentField}_${0}`,
      label: 'Fields',
      nodeType: NodeType.DocumentField,
      children: [],
    },
  ];

  // tslint:disable-next-line: variable-name
  private static _multiPageAnnotations: TreeData = {
    id: `${NodeType.MultiPageAnnotation}_${0}`,
    label: 'Multi Page Annotations',
    nodeType: NodeType.MultiPageAnnotation,
    children: [],
  };

  // tslint:disable-next-line: variable-name
  private static _productions: TreeData = {
    id: `${NodeType.Production}_${0}`,
    label: 'Productions',
    nodeType: NodeType.Production,
    children: [],
  };

  // tslint:disable-next-line: variable-name
  private static _searches: TreeData = {
    id: null,
    label: 'Searches',
    nodeType: NodeType.Search,
    children: [],
  };
  private static annotationsLoaded = false;

  private static docFieldsLoaded = false;
  private static multiPageAnnotationsLoaded = false;
  private static productionsLoaded = false;
  private static searchesLoaded = false;
}
