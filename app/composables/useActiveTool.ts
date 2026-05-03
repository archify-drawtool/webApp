export type ActiveToolName = 'drag' | 'node'

export function useActiveTool() {
  const activeTool = useState<ActiveToolName>('active-tool', () => 'drag')
  return { activeTool }
}
