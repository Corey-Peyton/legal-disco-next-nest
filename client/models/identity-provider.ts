import { AppUser } from './app-user';

export interface IdentityProvider {
    appUser: AppUser[];
    id: number;
    name: string;
    subjectId: string;
}
