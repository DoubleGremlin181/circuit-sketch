export type Point = { x: number; y: number }

export type MatchAlgorithm = 'hausdorff' | 'frechet' | 'turning-angle'

export interface MatchResult {
  circuitId: string
  /** Similarity score ranging from 0 to 100, where 100 is a perfect match */
  similarity: number
}

export interface BoundingBox {
  minX: number
  maxX: number
  minY: number
  maxY: number
  width: number
  height: number
  centerX: number
  centerY: number
}

export function getBoundingBox(points: Point[]): BoundingBox {
  if (points.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0, centerX: 0, centerY: 0 }
  }
  
  const minX = Math.min(...points.map(p => p.x))
  const maxX = Math.max(...points.map(p => p.x))
  const minY = Math.min(...points.map(p => p.y))
  const maxY = Math.max(...points.map(p => p.y))
  
  const width = maxX - minX
  const height = maxY - minY
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  
  return { minX, maxX, minY, maxY, width, height, centerX, centerY }
}

/**
 * Check if two line segments intersect
 */
function segmentsIntersect(p1: Point, p2: Point, p3: Point, p4: Point): Point | null {
  const x1 = p1.x, y1 = p1.y
  const x2 = p2.x, y2 = p2.y
  const x3 = p3.x, y3 = p3.y
  const x4 = p4.x, y4 = p4.y
  
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
  
  // Lines are parallel
  if (Math.abs(denom) < 1e-10) return null
  
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom
  
  // Check if intersection is within both line segments
  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: x1 + t * (x2 - x1),
      y: y1 + t * (y2 - y1)
    }
  }
  
  return null
}

/**
 * Find the first self-intersection in a path
 * Returns the index where the intersection occurs, or -1 if no intersection
 */
function findFirstSelfIntersection(points: Point[]): number {
  if (points.length < 4) return -1
  
  // Check each line segment against all previous segments (skipping adjacent ones)
  for (let i = 2; i < points.length - 1; i++) {
    const currentSegment = { p1: points[i], p2: points[i + 1] }
    
    // Check against all previous segments, excluding the immediately adjacent one
    for (let j = 0; j < i - 1; j++) {
      const prevSegment = { p1: points[j], p2: points[j + 1] }
      
      if (segmentsIntersect(currentSegment.p1, currentSegment.p2, prevSegment.p1, prevSegment.p2)) {
        // Found intersection - return the index where we should truncate
        return i
      }
    }
  }
  
  return -1
}

/**
 * Clean up self-intersecting paths by truncating at the first intersection
 * and ensuring the path forms a closed loop
 */
export function cleanupSelfIntersection(points: Point[]): Point[] {
  if (points.length < 4) return points
  
  const intersectionIndex = findFirstSelfIntersection(points)
  
  if (intersectionIndex !== -1) {
    // Truncate at the intersection point
    return points.slice(0, intersectionIndex + 1)
  }
  
  return points
}

/**
 * Normalize points: translate to origin and scale to unit size
 * Note: Does NOT apply rotation - preserves original orientation
 */
function normalizePoints(points: Point[]): Point[] {
  if (points.length === 0) return []
  
  const bbox = getBoundingBox(points)
  const scale = Math.max(bbox.width, bbox.height)
  
  if (scale === 0) return points
  
  return points.map(p => ({
    x: (p.x - bbox.minX) / scale,
    y: (p.y - bbox.minY) / scale
  }))
}

export function alignCircuitToDrawing(circuitPoints: Point[], drawnPoints: Point[]): Point[] {
  if (circuitPoints.length === 0 || drawnPoints.length === 0) return circuitPoints
  
  const drawnBBox = getBoundingBox(drawnPoints)
  const circuitBBox = getBoundingBox(circuitPoints)
  
  const scaleX = drawnBBox.width / circuitBBox.width
  const scaleY = drawnBBox.height / circuitBBox.height
  const scale = Math.min(scaleX, scaleY)
  
  return circuitPoints.map(p => ({
    x: drawnBBox.minX + (p.x - circuitBBox.minX) * scale + (drawnBBox.width - circuitBBox.width * scale) / 2,
    y: drawnBBox.minY + (p.y - circuitBBox.minY) * scale + (drawnBBox.height - circuitBBox.height * scale) / 2
  }))
}

function resamplePoints(points: Point[], numPoints: number): Point[] {
  if (points.length === 0) return []
  
  const totalLength = points.reduce((sum, point, i) => {
    if (i === 0) return 0
    const prev = points[i - 1]
    return sum + Math.sqrt(Math.pow(point.x - prev.x, 2) + Math.pow(point.y - prev.y, 2))
  }, 0)
  
  const segmentLength = totalLength / (numPoints - 1)
  const resampled: Point[] = [points[0]]
  let accumulatedLength = 0
  
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const dist = Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2))
    
    accumulatedLength += dist
    
    while (accumulatedLength >= segmentLength && resampled.length < numPoints) {
      const ratio = (accumulatedLength - segmentLength) / dist
      const newPoint = {
        x: curr.x - ratio * (curr.x - prev.x),
        y: curr.y - ratio * (curr.y - prev.y)
      }
      resampled.push(newPoint)
      accumulatedLength -= segmentLength
    }
  }
  
  while (resampled.length < numPoints) {
    resampled.push(points[points.length - 1])
  }
  
  return resampled.slice(0, numPoints)
}

function hausdorffDistance(points1: Point[], points2: Point[]): number {
  const distance = (p1: Point, p2: Point) =>
    Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
  
  const directional = (from: Point[], to: Point[]) => {
    return Math.max(...from.map(p1 => Math.min(...to.map(p2 => distance(p1, p2)))))
  }
  
  return Math.max(directional(points1, points2), directional(points2, points1))
}

/**
 * Rotate an array to start from a different index
 */
function rotateArray<T>(arr: T[], startIndex: number): T[] {
  if (arr.length === 0) return arr
  const idx = ((startIndex % arr.length) + arr.length) % arr.length
  return [...arr.slice(idx), ...arr.slice(0, idx)]
}

/**
 * Compute Frechet distance with a specific starting offset for points2
 */
function frechetDistanceWithOffset(points1: Point[], points2: Point[], offset: number): number {
  const rotated2 = rotateArray(points2, offset)
  const n = points1.length
  const m = rotated2.length
  const ca: number[][] = Array(n).fill(0).map(() => Array(m).fill(-1))
  
  const distance = (p1: Point, p2: Point) =>
    Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
  
  const compute = (i: number, j: number): number => {
    if (ca[i][j] > -1) return ca[i][j]
    
    const dist = distance(points1[i], rotated2[j])
    
    if (i === 0 && j === 0) {
      ca[i][j] = dist
    } else if (i > 0 && j === 0) {
      ca[i][j] = Math.max(compute(i - 1, 0), dist)
    } else if (i === 0 && j > 0) {
      ca[i][j] = Math.max(compute(0, j - 1), dist)
    } else {
      ca[i][j] = Math.max(
        Math.min(compute(i - 1, j), compute(i - 1, j - 1), compute(i, j - 1)),
        dist
      )
    }
    
    return ca[i][j]
  }
  
  return compute(n - 1, m - 1)
}

/**
 * Find optimal Frechet distance by trying different starting points
 */
function frechetDistance(points1: Point[], points2: Point[]): number {
  if (points1.length === 0 || points2.length === 0) return Infinity
  
  // Try multiple starting points (sample every 8th point for efficiency)
  const step = Math.max(1, Math.floor(points2.length / 8))
  let minDistance = Infinity
  
  for (let offset = 0; offset < points2.length; offset += step) {
    const dist = frechetDistanceWithOffset(points1, points2, offset)
    minDistance = Math.min(minDistance, dist)
  }
  
  return minDistance
}

/**
 * Compute turning angle distance with a specific starting offset for points2
 */
function turningAngleDistanceWithOffset(points1: Point[], points2: Point[], offset: number): number {
  const getAngles = (points: Point[]): number[] => {
    const angles: number[] = []
    for (let i = 0; i < points.length; i++) {
      const prev = points[(i - 1 + points.length) % points.length]
      const curr = points[i]
      const next = points[(i + 1) % points.length]
      
      const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x)
      const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x)
      let diff = angle2 - angle1
      
      while (diff > Math.PI) diff -= 2 * Math.PI
      while (diff < -Math.PI) diff += 2 * Math.PI
      
      angles.push(diff)
    }
    return angles
  }
  
  const angles1 = getAngles(points1)
  const rotated2 = rotateArray(points2, offset)
  const angles2 = getAngles(rotated2)
  
  const minLen = Math.min(angles1.length, angles2.length)
  let sum = 0
  
  for (let i = 0; i < minLen; i++) {
    sum += Math.abs(angles1[i] - angles2[i])
  }
  
  return sum / minLen
}

/**
 * Find optimal turning angle distance by trying different starting points
 */
function turningAngleDistance(points1: Point[], points2: Point[]): number {
  if (points1.length === 0 || points2.length === 0) return Infinity
  
  // Try multiple starting points (sample every 8th point for efficiency)
  const step = Math.max(1, Math.floor(points2.length / 8))
  let minDistance = Infinity
  
  for (let offset = 0; offset < points2.length; offset += step) {
    const dist = turningAngleDistanceWithOffset(points1, points2, offset)
    minDistance = Math.min(minDistance, dist)
  }
  
  return minDistance
}

/**
 * Calculate similarity between a drawn shape and a circuit layout using the specified algorithm.
 * 
 * @param drawnPoints - Array of points representing the user's drawn shape
 * @param circuitPoints - Array of points representing the circuit layout
 * @param algorithm - The matching algorithm to use ('hausdorff', 'frechet', or 'turning-angle')
 * 
 * @returns Similarity score from 0 to 100, where:
 *   - 100 = Perfect match (identical shapes)
 *   - 75-99 = Excellent match
 *   - 50-74 = Good match
 *   - 25-49 = Fair match
 *   - 0-24 = Poor match
 * 
 * **Algorithm Details:**
 * 
 * - **Hausdorff Distance**: Measures the greatest distance from any point on one shape
 *   to the closest point on another. Raw distances typically range from 0.0 (perfect) to 1.0+.
 *   The score uses exponential decay: `100 * exp(-distance * 3)` and is clamped to [0, 100].
 * 
 * - **Fréchet Distance**: Considers the order of points along the path, similar to walking
 *   a dog on a leash. Raw distances typically range from 0.0 (perfect) to 1.0+.
 *   The score uses exponential decay: `100 * exp(-distance * 4)` and is clamped to [0, 100].
 * 
 * - **Turning Angle**: Compares the sequence of turning angles at each point. Raw distances
 *   range from 0 (identical angles) to ~π (opposite angles).
 *   The score uses exponential decay: `100 * exp(-distance * 2)` and is clamped to [0, 100].
 * 
 * All algorithms normalize and resample shapes to 64 points before comparison, ensuring
 * scale and translation invariance while preserving orientation.
 */
export function matchShape(
  drawnPoints: Point[],
  circuitPoints: Point[],
  algorithm: MatchAlgorithm
): number {
  const numSamples = 64
  
  const normalized1 = normalizePoints(drawnPoints)
  const normalized2 = normalizePoints(circuitPoints)
  
  const resampled1 = resamplePoints(normalized1, numSamples)
  const resampled2 = resamplePoints(normalized2, numSamples)
  
  let distance: number
  let similarity: number
  
  switch (algorithm) {
    case 'hausdorff':
      distance = hausdorffDistance(resampled1, resampled2)
      // Convert raw Hausdorff distance (0.0 to 1.0+) to similarity percentage (0 to 100)
      // Exponential decay provides good discrimination: good matches ~0.4-0.5, poor matches > 0.6
      similarity = 100 * Math.exp(-distance * 3)
      // Clamp to valid percentage range [0, 100]
      return Math.max(0, Math.min(100, similarity))
    
    case 'frechet':
      distance = frechetDistance(resampled1, resampled2)
      // Convert raw Fréchet distance (0.0 to 1.0+) to similarity percentage (0 to 100)
      // Uses steeper decay factor for better sensitivity to path ordering
      similarity = 100 * Math.exp(-distance * 4)
      // Clamp to valid percentage range [0, 100]
      return Math.max(0, Math.min(100, similarity))
    
    case 'turning-angle':
      distance = turningAngleDistance(resampled1, resampled2)
      // Convert raw turning angle distance (0 to ~π) to similarity percentage (0 to 100)
      // Good matches have distance < 0.5, poor matches > 1.5
      similarity = 100 * Math.exp(-distance * 2)
      // Clamp to valid percentage range [0, 100]
      return Math.max(0, Math.min(100, similarity))
    
    default:
      return 0
  }
}
