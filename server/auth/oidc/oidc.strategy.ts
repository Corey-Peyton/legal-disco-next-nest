// src/auth/oidc.strategy.ts
import { UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { IncomingMessage } from 'node:http';
import { Strategy, Client, UserinfoResponse, TokenSet, Issuer } from 'openid-client';
import { AuthService } from './auth.service';

export const buildOpenIdClient = async () => {
  const TrustIssuer = await Issuer.discover(`http://localhost:5001/.well-known/openid-configuration`);
  const client = new TrustIssuer.Client({
    client_id: 'mvc',
    ClientId: 'mvc',
    //client_secret: 'K7gNU3sdo+OL0wNhqoVWhr3g6s1xYv72ol/pe/Unols=',
    client_secret: 'secret',
    redirect_uris: ['http://localhost:3100/api/callback'],
    post_logout_redirect_uris: ['http://localhost:3100/signout-callback-oidc'],
    token_endpoint_auth_method: 'client_secret_post',
  });
  return client;
};

export class OidcStrategy extends PassportStrategy(Strategy, 'oidc') {
  client: Client;

  constructor(private readonly authService: AuthService, client: Client) {
    super({
      client: client,
      params: {
        redirect_uri: 'http://localhost:3100/api/callback',
        scope: 'openid profile api1',
      },
      passReqToCallback: true,
      usePKCE: false,
    });

    this.client = client;
  }

  async validate(incomingMessage: IncomingMessage, tokenset: TokenSet): Promise<any> {
    const userinfo: UserinfoResponse = await this.client.userinfo(tokenset);

    try {
      const id_token = tokenset.id_token
      const access_token = tokenset.access_token
      const refresh_token = tokenset.refresh_token
      const user = {
        id_token,
        access_token,
        refresh_token,
        userinfo,
      }
      return user;
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
}