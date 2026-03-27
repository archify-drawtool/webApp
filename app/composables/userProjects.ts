import type { Project } from '~/types/Project';

export const useProjects = () => {
    const { get } = useApi();

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

    return { projects, loading, error, fetchProjects };
};