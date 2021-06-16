import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { defaultTransform, ModelBase } from '../general/model-base';

export class AuthToken extends ModelBase {
  @prop()
  tokenType: string;
  @prop()
  expiresIn: number;
  @prop()
  scope: string;
  @prop()
  accessToken: string;
  @prop()
  refreshToken: string;
  @prop()
  dateTime: Date;
}

export const AuthTokenModel = getModelForClass(AuthToken, defaultTransform);
