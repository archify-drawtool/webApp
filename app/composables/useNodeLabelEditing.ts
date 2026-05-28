import type { Ref } from 'vue'

export function useNodeLabelEditing<T extends HTMLInputElement | HTMLTextAreaElement>(
  id: string,
  getLabel: () => string | undefined,
  inputRef: Ref<T | null>,
  afterFocus?: () => void,
) {
  const { updateNodeLabelWithHistory } = useSketchCanvas()
  const { isDragToolActive } = useDragTool()
  const { pendingFocusNodeId } = useNodeTool()

  const editing = ref(false)
  const editValue = ref('')

  function startEdit() {
    if (isDragToolActive.value) return
    editValue.value = getLabel() ?? ''
    editing.value = true
    nextTick(() => {
      inputRef.value?.focus()
      afterFocus?.()
    })
  }

  function confirmEdit() {
    if (!editing.value) return
    editing.value = false
    updateNodeLabelWithHistory(id, editValue.value)
  }

  function cancelEdit() {
    editing.value = false
  }

  onMounted(() => {
    if (pendingFocusNodeId.value === id) {
      pendingFocusNodeId.value = null
      editValue.value = getLabel() ?? ''
      editing.value = true
      setTimeout(() => {
        inputRef.value?.focus()
        inputRef.value?.select()
        afterFocus?.()
      }, 0)
    }
  })

  return { editing, editValue, startEdit, confirmEdit, cancelEdit }
}
