import { prop } from '@typegoose/typegoose';
import { ModelBase } from '../general/model-base';
import { AppUser } from './app-user';

export class IdentityProvider extends ModelBase {
  @prop()
  appUsers: AppUser[];

  @prop()
  name: string;

  @prop()
  subjectId: string;
  constructor() {
    super();
    this.appUsers = [];
  }
}
