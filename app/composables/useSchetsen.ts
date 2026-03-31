import type { Schets } from '~/types/Schets';

export const useSchetsen = () => {
    const { get } = useApi();

    const schetsen = ref<Schets[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const getSchetsen = async (projectId: number): Promise<void> => {
        loading.value = true;
        error.value = null;

        try {
            const response = await get<Schets[]>(`/api/projects/${projectId}/schetsen`);
            schetsen.value = response ?? [];
        } catch (e) {
            const err = e as { statusMessage?: string };
            error.value = err?.statusMessage ?? 'Er is een onbekende fout opgetreden';
        } finally {
            loading.value = false;
        }
    };

    return { schetsen, loading, error, getSchetsen };
};
