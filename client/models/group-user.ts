import { AppUser } from './app-user';
import { Group } from './group';

export interface GroupUser {
    group: Group;
    groupId: number;
    id: number;
    user: AppUser;
    userId: number;
}
