export interface SketchTopbarState {
  sketchTitle: string
  backTo: string
  sketchId?: number
  projectId?: number
}

export function useSketchTopbar() {
  const state = useState<SketchTopbarState | null>('sketch-topbar', () => null)

  function setTopbar(data: SketchTopbarState) {
    state.value = data
  }

  function clearTopbar() {
    state.value = null
  }

  return { topbarState: state, setTopbar, clearTopbar }
}
