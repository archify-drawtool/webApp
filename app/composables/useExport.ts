import { toPng } from 'html-to-image'
import { useVueFlow } from '@vue-flow/core'
import { SKETCH_CANVAS_ID } from '~/composables/useSketchCanvas'

export function useExport() {
  const { vueFlowRef, fitView, getViewport, setViewport } = useVueFlow(SKETCH_CANVAS_ID)

  async function exportAsPng(sketchTitle: string): Promise<void> {
    if (!vueFlowRef.value) {
      return
    }

    const previousViewport = getViewport()
    await fitView({ padding: 0.1, duration: 0 })
    await nextTick()

    const el = vueFlowRef.value

    // html-to-image neemt geen computed CSS mee voor SVG elementen.
    // SVG default: fill=black, stroke=none. Fix: inline computed stijlen op alle SVG shapes.
    type ShapeBackup = {
      el: Element
      fill: string | null
      stroke: string | null
      strokeWidth: string | null
      markerEnd: string | null
      markerStart: string | null
    }
    const backups: ShapeBackup[] = []

    // Verwerk alle SVG shapes (path, polyline, polygon, line)
    const svgShapes = Array.from(el.querySelectorAll<SVGElement>('svg path, svg polyline, svg polygon, svg line'))
    for (const shape of svgShapes) {
      const computed = window.getComputedStyle(shape)
      const markerEnd = shape.getAttribute('marker-end')
      const markerStart = shape.getAttribute('marker-start')

      backups.push({
        el: shape,
        fill: shape.getAttribute('fill'),
        stroke: shape.getAttribute('stroke'),
        strokeWidth: shape.getAttribute('stroke-width'),
        markerEnd,
        markerStart,
      })

      // Inline computed fill en stroke
      shape.setAttribute('fill', computed.fill || 'none')
      shape.setAttribute('stroke', computed.stroke || 'none')
      if (computed.strokeWidth) shape.setAttribute('stroke-width', computed.strokeWidth)

      // Strip alleen ongeldige marker referenties (url('#') met lege ID)
      if (markerEnd === "url('#')") shape.removeAttribute('marker-end')
      if (markerStart === "url('#')") shape.removeAttribute('marker-start')
    }

    try {
      await toPng(el, { backgroundColor: '#ffffff' })
      const dataUrl = await toPng(el, { backgroundColor: '#ffffff' })

      const slug = sketchTitle
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        || 'schets'
      const date = new Date().toISOString().split('T')[0]

      const link = document.createElement('a')
      link.download = `${slug}-${date}.png`
      link.href = dataUrl
      link.click()
    }
    finally {
      for (const { el: shape, fill, stroke, strokeWidth, markerEnd, markerStart } of backups) {
        if (fill !== null) shape.setAttribute('fill', fill)
        else shape.removeAttribute('fill')
        if (stroke !== null) shape.setAttribute('stroke', stroke)
        else shape.removeAttribute('stroke')
        if (strokeWidth !== null) shape.setAttribute('stroke-width', strokeWidth)
        else shape.removeAttribute('stroke-width')
        if (markerEnd !== null) shape.setAttribute('marker-end', markerEnd)
        if (markerStart !== null) shape.setAttribute('marker-start', markerStart)
      }
      await setViewport(previousViewport, {duration: 0})
    }
  }

  return { exportAsPng }
}
