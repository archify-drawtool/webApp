import type { Project } from '~/types/Project';

export const useProjects = () => {
    const { get, post, del } = useApi();

    const projects = ref<Project[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const projectToDelete = ref<Project | null>(null);
    const deleteError = ref<string | null>(null);
    const deletePending = ref(false);

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

    const deleteProject = async (projectId: number): Promise<void> => {
        await del(`/api/projects/${projectId}`);
        projects.value = projects.value.filter(p => p.id !== projectId);
    };

    const onDeleteRequest = (project: Project) => {
        projectToDelete.value = project;
        deleteError.value = null;
    };

    const onDeleteCancel = () => {
        projectToDelete.value = null;
    };

    const onDeleteConfirm = async (): Promise<Project | null> => {
        if (!projectToDelete.value) return null;
        deletePending.value = true;
        try {
            const deleted = projectToDelete.value;
            await deleteProject(deleted.id);
            projectToDelete.value = null;
            return deleted;
        } catch (e) {
            const err = e as { statusMessage?: string };
            deleteError.value = err?.statusMessage ?? 'Er is een fout opgetreden bij het verwijderen.';
            return null;
        } finally {
            deletePending.value = false;
        }
    };

    return {
        projects, loading, error,
        fetchProjects, createProject, deleteProject,
        projectToDelete, deleteError, deletePending,
        onDeleteRequest, onDeleteCancel, onDeleteConfirm,
    };
};