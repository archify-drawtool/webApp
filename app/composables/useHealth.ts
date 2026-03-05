import {useApi} from "~/composables/useApi";
import type {HealthResponse} from "~/types/Health";

// Export gebruiken als je in ander classes deze methode wilt bereiken
export const useHealth = () => {
    /**
        De { get } wordt hier gebruikt om alleen de get methode te halen uit useApi

        Dit zou hetzelfde resultaat opleveren als je meerdere methodes nodig hebt zoals post of delete:
            const api = useApi()
            api.get<HealthResponse>('/api/health')
            api.delete('/api/users/1')

        Maar door de deconstruction (omdat we hier alleen get nodig hebben) gebruiken we:
            const { get } = useApi()
            get<HealthResponse>('/api/health')
     */
    const { get } = useApi()

    const checkHealth = async (): Promise<HealthResponse | undefined> => {
        return await get<HealthResponse>('/api/health')
    }

    return { checkHealth }
}