import type { Project } from '~/types/Project';

export const useProjects = () => {
    const { get, post, patch } = useApi();

    const projects = ref<Project[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const fetchProjects = async (): Promise<void> => {
        loading.value = true;
        error.value = null;

        try {
            const response = await get<Project[]>('/api/projects');
            projects.value = response ?? [];
        } catch (e) {
            const err = e as { statusMessage?: string };
            error.value = err?.statusMessage ?? 'Er is een onbekende fout opgetreden';
        } finally {
            loading.value = false;
        }
    };

    const createProject = async (title: string): Promise<Project> => {
        const response = await post<Project>('/api/projects', { title });
        if (!response) throw createError({ statusCode: 500, statusMessage: 'Er is een onbekende fout opgetreden' });
        return response;
    };

    const renameProject = async (id: number, title: string): Promise<void> => {
        await patch(`/api/projects/${id}`, { title });
    };

    return { projects, loading, error, fetchProjects, createProject, renameProject };
};