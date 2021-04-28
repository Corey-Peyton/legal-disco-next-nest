import { AppUser } from './app-user';
import { DatabaseServer } from './database-server';
import { DocumentMetadata } from './document-metadata';
import { Group } from './group';
import { GroupUser } from './group-user';
import { IdentityProvider } from './identity-provider';
import { Project } from './project';
import { ProjectGroup } from './project-group';
import { ProjectUser } from './project-user';
import { UserClaim } from './user-claim';

export interface MasterContext {
    appUser: AppUser[];
    databaseServer: DatabaseServer[];
    documentMetadata: DocumentMetadata[];
    group: Group[];
    groupUser: GroupUser[];
    identityProvider: IdentityProvider[];
    project: Project[];
    projectGroup: ProjectGroup[];
    projectUser: ProjectUser[];
    userClaim: UserClaim[];
}
