import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import IndexPage from '../app/pages/index.vue'

describe('Index pagina', () => {
    it('kan worden geladen', async () => {
        const wrapper = await mountSuspended(IndexPage)
        expect(wrapper.html()).toContain('<div')
    })
})