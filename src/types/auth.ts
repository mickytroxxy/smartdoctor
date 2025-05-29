export type UserRole = 'user' | 'dj' | 'club_owner' | 'admin';

export interface PlayMyJamProfile {
    uid: string;
    fname: string;
    lname: string;
    email: string;
    image: string;
    phone: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    totalRequests?: number;
    totalEarnings?: number;
    isActive: boolean;
} 