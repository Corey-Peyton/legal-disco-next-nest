import { Group } from './group';
import { Project } from './project';

export interface ProjectGroup {
    group: Group;
    groupId: number;
    id: number;
    project: Project;
    projectId: number;
}
