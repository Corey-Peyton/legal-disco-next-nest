import { AppUser } from './app-user';
import { Project } from './project';

export interface ProjectUser {
    appUser: AppUser;
    id: number;
    project: Project;
    projectId: number;
    userId: number;
}
