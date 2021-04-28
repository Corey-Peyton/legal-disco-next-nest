import { GroupUser } from './group-user';
import { IdentityProvider } from './identity-provider';
import { ProjectUser } from './project-user';
import { UserClaim } from './user-claim';

export interface AppUser {
    email: string;
    firstName: string;
    groupUser: GroupUser[];
    id: number;
    identityProvider: IdentityProvider;
    identityProviderId: number;
    isActive: boolean;
    lastName: string;
    name: string;
    password: string;
    projectUser: ProjectUser[];
    subjectId: string;
    userClaim: UserClaim[];
}
