import { IAuth } from './controllers/i-auth-request';

export class GoogleAuth implements IAuth {
    client_id = '270840670535-rrb78bln6hgqiji47e7ujocin7im33hf.apps.googleusercontent.com';
    redirect_uri = 'https://localhost:44375/authredirect';
    token_uri = 'https://www.googleapis.com/oauth2/v4/token';
    client_secret = 'svSeVipQ45rAWYhwQ-0snGlZ';
}