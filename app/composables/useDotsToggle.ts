const showDots = ref(true)

export function useDotsToggle() {
  function toggleDots() {
    showDots.value = !showDots.value
  }

  function setDotsVisible(value: boolean) {
    showDots.value = value
  }

  return { showDots, toggleDots, setDotsVisible }
}
