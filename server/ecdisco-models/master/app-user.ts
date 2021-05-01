import { getModelForClass, prop } from '@typegoose/typegoose';
import { ModelBase } from '../general/model-base';
import { GroupUser } from './group-user';
import { IdentityProvider } from './identity-provider';
import { ProjectUser } from './project-user';
import { UserClaim } from './user-claim';

export class AppUser extends ModelBase {
  @prop()
  email: string;
  @prop()
  firstName: string;
  @prop()
  groupUsers: GroupUser[];

  @prop()
  identityProvider: IdentityProvider;
  @prop()
  identityProviderId: number;
  @prop()
  isActive: boolean;
  @prop()
  lastName: string;
  @prop()
  name: string;
  @prop()
  password: string;
  @prop()
  projectUsers: ProjectUser[];
  @prop()
  subjectId: string;
  @prop()
  userClaims: UserClaim[];

  constructor() {
    super();
    this.groupUsers = [];
    this.projectUsers = [];
    this.userClaims = [];
  }
}

const AppUserModel = getModelForClass(AppUser);
export { AppUserModel };
