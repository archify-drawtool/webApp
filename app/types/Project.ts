import type { User } from '~/types/Auth';

export interface Project {
    id: number;
    title: string;
    created_by: number | null;
    creator: User | null;
    created_at: string;
    updated_at: string;
}