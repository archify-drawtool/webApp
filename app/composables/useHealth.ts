import {useApi} from "~/composables/useApi";
import type {HealthResponse} from "~/types/Health";

// Use export when you want to access this method in other classes
export const useHealth = () => {
    /**
         The { get } is used here to retrieve only the get method from useApi.

         This would produce the same result if you need multiple methods like post or delete:
         const api = useApi()
         api.get<HealthResponse>('/api/health')
         api.delete('/api/users/1')

         But because of the deconstruction (because we only need get here), we use:
         const { get } = useApi()
         get<HealthResponse>('/api/health')
     */
    const { get } = useApi()

    const checkHealth = async (): Promise<HealthResponse | undefined> => {
        return await get<HealthResponse>('/api/health')
    }

    return { checkHealth }
}