import * as LucideIcons from 'lucide-vue-next'

function toPascalCase(str: string) {
  return str.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')
}

const lucide = LucideIcons as unknown as Record<string, Component>

export function resolveIcon(iconName: string): Component {
  return lucide[toPascalCase(iconName)] ?? LucideIcons.Square
}
