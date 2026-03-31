import type { User } from '~/types/Auth';

export interface Schets {
    id: number;
    title: string;
    project_id: number;
    created_by: number | null;
    creator: User | null;
    created_at: string;
    updated_at: string;
}
