import { ApiService } from '../api-service';
import { SetAttributeValuesWithWhere } from './set-attribute-values-with-where';

export class CommonCRUDService {

    static fieldsUpsert(entity: string, setAttributeValues: any, filterAttributeValues?: any): Promise<any> {

        Object.keys(setAttributeValues)
            .forEach((key: any) => {

                if (setAttributeValues[key] === '' || setAttributeValues[key] === []) {
                    setAttributeValues[key] = null;
                }
            });

        if (filterAttributeValues !== null) {
            Object.keys(filterAttributeValues)
                .forEach((key: any) => {

                    if (filterAttributeValues[key] === null) {
                        delete filterAttributeValues[key];
                    }
                });
        }

        return CommonCRUDService.post('upsert', { entity, setAttributeValues, filterAttributeValues });
    }

    static fieldsBulkUpsert(entity: string, setAttributeValuesWithWheres: SetAttributeValuesWithWhere[]): Promise<any> {

        setAttributeValuesWithWheres.forEach((setAttributeValuesWithWhere) => {

            Object.keys(setAttributeValuesWithWhere.setAttributeValues)
                .forEach((key: any) => {

                    if (setAttributeValuesWithWhere.setAttributeValues[key] === ''
                        || setAttributeValuesWithWhere.setAttributeValues[key] === []) {
                        setAttributeValuesWithWhere.setAttributeValues[key] = null;
                    }

                    if (setAttributeValuesWithWhere.setAttributeValues[key] === null) {
                        delete setAttributeValuesWithWhere.setAttributeValues[key];
                    }
                });

            Object.keys(setAttributeValuesWithWhere.whereAttributeValues)
                .forEach((key: any) => {

                    if (setAttributeValuesWithWhere.whereAttributeValues[key] === ''
                        || setAttributeValuesWithWhere.whereAttributeValues[key] === []) {
                        setAttributeValuesWithWhere.whereAttributeValues[key] = null;
                    }

                    if (setAttributeValuesWithWhere.whereAttributeValues[key] === null) {
                        delete setAttributeValuesWithWhere.whereAttributeValues[key];
                    }
                });
        });

        return CommonCRUDService.post('bulkUpsert', { entity, setAttributeValuesWithWheres });
    }

    static delete(entity: string, filterAttributeValues: {}) {
        CommonCRUDService.post('delete', { entity, filterAttributeValues });
    }

    static get(entity: string, values: {}): Promise<any> {
        return CommonCRUDService.post('get', { entity, values });
    }

    private static post(url: string, data: any): Promise<any> {
        return ApiService.post(`general/${url}`, data);
    }
}
