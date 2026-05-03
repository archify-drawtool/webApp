import type { SketchSummary } from '~/types/SketchSummary';

export const useSketches = () => {
    const { get, del } = useApi();

    const sketches = ref<SketchSummary[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const fetchSketches = async (projectId: number): Promise<void> => {
        loading.value = true;
        error.value = null;

        try {
            const response = await get<SketchSummary[]>(`/api/projects/${projectId}/sketches`);
            sketches.value = response ?? [];
        } catch (e) {
            const err = e as { statusMessage?: string };
            error.value = err?.statusMessage ?? 'Er is een onbekende fout opgetreden';
        } finally {
            loading.value = false;
        }
    };

    const deleteSketch = async (projectId: number, sketchId: number): Promise<void> => {
        await del(`/api/projects/${projectId}/sketches/${sketchId}`);
        sketches.value = sketches.value.filter(s => s.id !== sketchId);
    };

    return { sketches, loading, error, fetchSketches, deleteSketch };
};
