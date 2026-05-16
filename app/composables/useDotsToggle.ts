export function useDotsToggle() {
  const { patch } = useApi()
  const { user } = useAuth()

  const showDots = computed(() => user.value?.show_background_dots ?? true)

  async function toggleDots() {
    const newValue = !showDots.value
    if (user.value) user.value.show_background_dots = newValue
    await patch('/api/user', { show_background_dots: newValue })
  }

  return { showDots, toggleDots }
}
