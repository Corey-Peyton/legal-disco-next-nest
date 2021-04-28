import { AppUser } from './app-user';

export interface UserClaim {
    appUser: AppUser;
    appUserId: number;
    id: number;
    issuer: string;
    originalIssuer: string;
    subject: string;
    type: string;
    value: string;
    valueType: string;
}
