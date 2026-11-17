export interface SpatialRect {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}

export interface SpatialTraceFrame {
  timestamp: number
  linearProgress: number
  easedProgress: number
  openProgress: number
  maxOverlapArea: number
  minimumRailGap: number
  primaryKpiConnected: boolean
  rects: Record<string, SpatialRect>
}

interface SpatialMotionTrace {
  direction: 'opening' | 'closing'
  duration: number
  startedAt: string
  frameCount: number
  maxOverlapArea: number
  minimumRailGap: number
  terminalDrift: number
  primaryKpiConnectedEveryFrame: boolean
  frames: SpatialTraceFrame[]
}

export type WindowWithGymkidsMotionTrace = Window & {
  __GYMKIDS_MOTION_TRACE__?: SpatialMotionTrace
}

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const lerp = (from: number, to: number, progress: number) => from + (to - from) * progress

export const spatialEasing = (progress: number) => {
  const x1 = 0.4
  const y1 = 0
  const x2 = 0.2
  const y2 = 1
  const cx = 3 * x1
  const bx = 3 * (x2 - x1) - cx
  const ax = 1 - cx - bx
  const cy = 3 * y1
  const by = 3 * (y2 - y1) - cy
  const ay = 1 - cy - by
  const sampleX = (time: number) => ((ax * time + bx) * time + cx) * time
  const sampleY = (time: number) => ((ay * time + by) * time + cy) * time
  const sampleDerivativeX = (time: number) => (3 * ax * time + 2 * bx) * time + cx
  let time = progress

  for (let iteration = 0; iteration < 7; iteration += 1) {
    const derivative = sampleDerivativeX(time)

    if (Math.abs(derivative) < 0.000001)
      break

    time = clamp01(time - (sampleX(time) - progress) / derivative)
  }

  return sampleY(time)
}

export const snapshotRect = (rect: DOMRect, container: DOMRect): SpatialRect => ({
  left: rect.left - container.left,
  top: rect.top - container.top,
  right: rect.right - container.left,
  bottom: rect.bottom - container.top,
  width: rect.width,
  height: rect.height,
})

export const interpolateRect = (from: SpatialRect, to: SpatialRect, progress: number): SpatialRect => {
  const left = lerp(from.left, to.left, progress)
  const top = lerp(from.top, to.top, progress)
  const width = lerp(from.width, to.width, progress)
  const height = lerp(from.height, to.height, progress)

  return {
    left,
    top,
    right: left + width,
    bottom: top + height,
    width,
    height,
  }
}

const overlapArea = (first: SpatialRect, second: SpatialRect) => (
  Math.max(0, Math.min(first.right, second.right) - Math.max(first.left, second.left))
  * Math.max(0, Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top))
)

export const maxPairwiseOverlap = (rects: SpatialRect[]) => {
  let maximum = 0

  rects.forEach((first, firstIndex) => {
    rects.slice(firstIndex + 1).forEach(second => {
      maximum = Math.max(maximum, overlapArea(first, second))
    })
  })

  return maximum
}

export const minimumRailGap = (rects: Record<string, SpatialRect>) => {
  const validity = rects.validity
  const promo = rects.promo
  const trial = rects.trial
  const conversion = rects.conversion

  if (!validity || !promo || !trial || !conversion)
    return Number.POSITIVE_INFINITY

  return Math.min(
    promo.top - validity.bottom,
    trial.top - validity.bottom,
    conversion.top - promo.bottom,
    conversion.top - trial.bottom,
  )
}

export const rectDrift = (actual: SpatialRect, expected: SpatialRect) => Math.max(
  Math.abs(actual.left - expected.left),
  Math.abs(actual.top - expected.top),
  Math.abs(actual.right - expected.right),
  Math.abs(actual.bottom - expected.bottom),
)

export const gridAreaRect = (
  grid: HTMLElement,
  columnStart: number,
  columnEnd: number,
  rowStart: number,
  rowEnd: number,
): SpatialRect => {
  const style = getComputedStyle(grid)
  const columns = style.gridTemplateColumns.split(' ').map(Number.parseFloat)
  const rows = style.gridTemplateRows.split(' ').map(Number.parseFloat)
  const columnGap = Number.parseFloat(style.columnGap) || 0
  const rowGap = Number.parseFloat(style.rowGap) || 0
  const left = columns.slice(0, columnStart - 1).reduce((sum, value) => sum + value, 0) + columnGap * (columnStart - 1)
  const top = rows.slice(0, rowStart - 1).reduce((sum, value) => sum + value, 0) + rowGap * (rowStart - 1)
  const width = columns.slice(columnStart - 1, columnEnd - 1).reduce((sum, value) => sum + value, 0) + columnGap * (columnEnd - columnStart - 1)
  const height = rows.slice(rowStart - 1, rowEnd - 1).reduce((sum, value) => sum + value, 0) + rowGap * (rowEnd - rowStart - 1)

  return {
    left,
    top,
    right: left + width,
    bottom: top + height,
    width,
    height,
  }
}
