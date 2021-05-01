import { getModelForClass, prop } from '@typegoose/typegoose';
import { ModelBase } from '../general/model-base';

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

const AuthTokenModel = getModelForClass(AuthToken);
export { AuthTokenModel };
