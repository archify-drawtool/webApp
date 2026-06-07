import type { SketchSummary } from '~/types/SketchSummary';

export const useSketches = () => {
    const { get, del } = useApi();

    const sketches = ref<SketchSummary[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const sketchToDelete = ref<SketchSummary | null>(null);
    const deleteError = ref<string | null>(null);
    const deletePending = ref(false);

    const fetchSketches = async (projectId?: number): Promise<void> => {
        loading.value = true;
        error.value = null;

        try {
            const url = projectId ? `/api/projects/${projectId}/sketches` : '/api/sketches?projectless=true';
            const response = await get<SketchSummary[]>(url);
            sketches.value = response ?? [];
        } catch (e) {
            const err = e as { statusMessage?: string };
            error.value = err?.statusMessage ?? 'Er is een onbekende fout opgetreden';
        } finally {
            loading.value = false;
        }
    };

    const deleteSketch = async (sketchId: number): Promise<void> => {
        await del(`/api/sketches/${sketchId}`);
        sketches.value = sketches.value.filter(s => s.id !== sketchId);
    };

    const onDeleteRequest = (sketch: SketchSummary) => {
        sketchToDelete.value = sketch;
        deleteError.value = null;
    };

    const onDeleteCancel = () => {
        sketchToDelete.value = null;
    };

    const onDeleteConfirm = async () => {
        if (!sketchToDelete.value) return;
        deletePending.value = true;
        try {
            await deleteSketch(sketchToDelete.value.id);
            sketchToDelete.value = null;
        } catch (e) {
            const err = e as { statusMessage?: string };
            deleteError.value = err?.statusMessage ?? 'Er is een fout opgetreden bij het verwijderen.';
        } finally {
            deletePending.value = false;
        }
    };

    return {
        sketches, loading, error,
        fetchSketches, deleteSketch,
        sketchToDelete, deleteError, deletePending,
        onDeleteRequest, onDeleteCancel, onDeleteConfirm,
    };
};
