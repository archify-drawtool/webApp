import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { createError } from 'h3'
import { useSketchCanvas } from '../app/composables/useSketchCanvas'
import type { Sketch } from '../app/types/Sketch'

// vi.hoisted zorgt dat deze mocks beschikbaar zijn vóór vi.mock() wordt uitgevoerd
const { mockGet, mockSetNodes, mockSetEdges } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockSetNodes: vi.fn(),
  mockSetEdges: vi.fn(),
}))

// useVueFlow komt uit @vue-flow/core (geen Nuxt auto-import), dus vi.mock gebruiken
vi.mock('@vue-flow/core', () => ({
  useVueFlow: () => ({
    setNodes: mockSetNodes,
    setEdges: mockSetEdges,
    onNodesChange: vi.fn(),
    onEdgesChange: vi.fn(),
    onNodeDragStop: vi.fn(),
    toObject: vi.fn(() => ({ nodes: [], edges: [] })),
  }),
}))

mockNuxtImport('useApi', () => () => ({
  get: mockGet,
  put: vi.fn(),
}))

mockNuxtImport('useAppConfig', () => () => ({
  sketch: { saveDebounceMs: 2000 },
}))

const sketchFixture: Sketch = {
  id: 1,
  title: 'Test schets',
  project_id: 42,
  canvas_state: {
    nodes: [
      { id: 'n1', type: 'default', label: 'Node 1', position: { x: 100, y: 200 }, data: {} },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', label: 'Verbinding' },
    ],
  },
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useSketchCanvas – fetchSketch', () => {
  it('laadt nodes en edges op de canvas na een succesvolle API call', async () => {
    mockGet.mockResolvedValue(sketchFixture)

    const { fetchSketch } = useSketchCanvas()
    const result = await fetchSketch('1', '42')

    expect(mockGet).toHaveBeenCalledWith('/api/projects/42/sketches/1')
    expect(mockSetNodes).toHaveBeenCalledWith(sketchFixture.canvas_state!.nodes)
    expect(result).toEqual(sketchFixture)
  })

  it('vult een lege canvas als canvas_state null is', async () => {
    mockGet.mockResolvedValue({ ...sketchFixture, canvas_state: null })

    const { fetchSketch } = useSketchCanvas()
    await fetchSketch('1', '42')

    expect(mockSetNodes).toHaveBeenCalledWith([])
    expect(mockSetEdges).toHaveBeenCalledWith([])
  })

  it('gebruikt het fallback endpoint als er geen projectId is', async () => {
    mockGet.mockResolvedValue(sketchFixture)

    const { fetchSketch } = useSketchCanvas()
    await fetchSketch('1')

    expect(mockGet).toHaveBeenCalledWith('/api/sketches/1')
  })

  it('gooit een 404 error als de API undefined teruggeeft', async () => {
    mockGet.mockResolvedValue(undefined)

    const { fetchSketch } = useSketchCanvas()

    await expect(fetchSketch('999', '42')).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: 'Schets niet gevonden',
    })

    expect(mockSetNodes).not.toHaveBeenCalled()
    expect(mockSetEdges).not.toHaveBeenCalled()
  })

  it('gooit een error door als de API een netwerkfout geeft', async () => {
    mockGet.mockRejectedValue(
      createError({ statusCode: 500, statusMessage: 'Internal Server Error' }),
    )

    const { fetchSketch } = useSketchCanvas()

    await expect(fetchSketch('1', '42')).rejects.toMatchObject({
      statusCode: 500,
    })

    expect(mockSetNodes).not.toHaveBeenCalled()
    expect(mockSetEdges).not.toHaveBeenCalled()
  })

  it('zet edges standaard op smoothstep als type ontbreekt', async () => {
    const sketchZonderEdgeType: Sketch = {
      ...sketchFixture,
      canvas_state: {
        nodes: [],
        edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
      },
    }
    mockGet.mockResolvedValue(sketchZonderEdgeType)

    const { fetchSketch } = useSketchCanvas()
    await fetchSketch('1', '42')

    expect(mockSetEdges).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'e1', type: 'smoothstep' }),
    ])
  })
})
