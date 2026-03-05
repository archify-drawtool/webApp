export const useApi = () => {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl

    const handleError = (error: unknown): never => {
        const err = error as { status?: number; data?: { message?: string }; message?: string }

        const message =
            err?.data?.message ||
            err?.message ||
            'Er is een onbekende fout opgetreden'

        throw createError({ statusCode: err?.status || 500, statusMessage: message })
    }

    const get = async <T>(endpoint: string, options = {}) => {
        try {
            return await $fetch<T>(`${baseURL}${endpoint}`, {
                method: 'GET',
                headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
                ...options,
            })
        } catch (error) { handleError(error) }
    }

    return { get } // Later post etc. toevoegen
}