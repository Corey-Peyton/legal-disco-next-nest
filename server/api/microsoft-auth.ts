import { IAuth } from './controllers/i-auth-request';

export class MicrosoftAuth implements IAuth {
    client_id = '955783b9-8d37-412f-a32e-d0c385cdd686';
    redirect_uri = 'https://localhost:44375/authredirect';
    token_uri = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
    client_secret = '.9Ht1q4kGr.-Vczgmp7Y~2xwNJuzQ~~i3M';
}