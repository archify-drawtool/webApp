import type { Toast, ToastVariant } from '~/types/Toast'

// Module-scoped state zodat alle aanroepen van useToast dezelfde stack delen.
const toasts = ref<Toast[]>([])
const timers = new Map<number, ReturnType<typeof setTimeout>>()
let nextId = 0

export function useToast() {
  const config = useAppConfig()

  function remove(id: number) {
    const timer = timers.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.delete(id)
    }
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  function add(message: string, variant: ToastVariant, duration?: number): number {
    const id = ++nextId
    toasts.value = [...toasts.value, { id, message, variant }]

    const fallback = variant === 'error'
      ? config.toast?.errorMs
      : config.toast?.successMs
    const ms = duration ?? fallback ?? 4000

    if (import.meta.client && ms > 0) {
      timers.set(id, setTimeout(() => remove(id), ms))
    }
    return id
  }

  function success(message: string, duration?: number) {
    return add(message, 'success', duration)
  }

  function error(message: string, duration?: number) {
    return add(message, 'error', duration)
  }

  return { toasts, add, success, error, remove }
}
