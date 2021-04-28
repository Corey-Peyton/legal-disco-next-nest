import { Datasource } from './datasource';

export interface Document {
    datasource: Datasource;
    datasourceId: number;
    id: number;
    name: string;
    type: string;
}
