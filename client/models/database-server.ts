import { Project } from './project';

export interface DatabaseServer {
    id: number;
    name: string;
    project: Project[];
}
