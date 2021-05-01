export interface IAuth {
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  token_uri?: string;
  refresh_token?: string;
  grant_type?: string;
}
