import { Datasource } from './datasource';
import { ProjectGroup } from './project-group';
import { ProjectUser } from './project-user';

export interface Project {
    datasource: Datasource[];
    id: number;
    name: string;
    projectGroup: ProjectGroup[];
    projectUser: ProjectUser[];
}
