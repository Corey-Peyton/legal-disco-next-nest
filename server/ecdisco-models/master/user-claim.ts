import { prop } from '@typegoose/typegoose';
import { ModelBase } from '../general/model-base';
import { AppUser } from './app-user';

export class UserClaim extends ModelBase {

  @prop()
  appUserId: number;
  @prop()
  issuer: string;
  @prop()
  originalIssuer: string;
  @prop()
  subject: string;
  @prop()
  type: string;
  @prop()
  value: string;
  @prop()
  valueType: string;
  @prop()
  appUser: AppUser;
}
