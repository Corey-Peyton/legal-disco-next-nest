import { Datasource } from './Datasource';

export interface AuthToken {
    accessToken: string;
    code: string;
    datasource: Datasource;
    datasourceId: number;
    dateTime: Date;
    expiresIn: number;
    id: number;
    refreshToken: string;
    scope: string;
    tokenType: string;
}
