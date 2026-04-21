import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import IndexPage from '../app/pages/index.vue'

const { navigateToMock } = vi.hoisted(() => ({
    navigateToMock: vi.fn()
}))

vi.mock('#app/composables/router', async (importOriginal) => {
    const actual = await importOriginal<typeof import('#app/composables/router')>()
    return {
        ...actual,
        navigateTo: navigateToMock
    }
})

describe('Index pagina', () => {
    it('stuurt door naar de projecten pagina', async () => {
        navigateToMock.mockClear()
        await mountSuspended(IndexPage)
        expect(navigateToMock).toHaveBeenCalledWith('/projecten', { replace: true })
    })
})