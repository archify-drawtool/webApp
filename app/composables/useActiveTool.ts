export type ActiveToolName = 'drag' | 'pointer' | 'node'

export function useActiveTool() {
  const activeTool = useState<ActiveToolName>('active-tool', () => 'drag')
  return { activeTool }
}
