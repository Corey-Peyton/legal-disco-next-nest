import { GroupUser } from './group-user';
import { ProjectGroup } from './project-group';

export interface Group {
    groupUser: GroupUser[];
    id: number;
    name: string;
    projectGroup: ProjectGroup[];
}
