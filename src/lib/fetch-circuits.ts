interface GeoJSONCoordinate {
  type: string
  coordinates: number[][] | number[][][]
}

interface GeoJSONFeature {
  type: string
  properties: Record<string, any>
  geometry: GeoJSONCoordinate
}

interface GeoJSONData {
  type: string
  features: GeoJSONFeature[]
}

interface Point {
  x: number
  y: number
}

function normalizeCoordinates(coords: number[][]): Point[] {
  if (coords.length === 0) return []

  let minLat = Infinity
  let maxLat = -Infinity
  let minLon = Infinity
  let maxLon = -Infinity

  coords.forEach(([lon, lat]) => {
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
    minLon = Math.min(minLon, lon)
    maxLon = Math.max(maxLon, lon)
  })

  const latRange = maxLat - minLat
  const lonRange = maxLon - minLon

  return coords.map(([lon, lat]) => ({
    x: (lon - minLon) / lonRange,
    y: 1 - (lat - minLat) / latRange
  }))
}

function extractCoordinates(geometry: GeoJSONCoordinate): number[][] {
  if (geometry.type === 'LineString') {
    return geometry.coordinates as number[][]
  } else if (geometry.type === 'MultiLineString') {
    const multiCoords = geometry.coordinates as number[][][]
    return multiCoords.flat()
  } else if (geometry.type === 'Polygon') {
    const polygonCoords = geometry.coordinates as number[][][]
    return polygonCoords[0]
  }
  return []
}

export async function fetchCircuitGeoJSON(circuitId: string): Promise<Point[]> {
  try {
    const url = `https://raw.githubusercontent.com/bacinger/f1-circuits/main/circuits/${circuitId}.geojson`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch circuit: ${response.statusText}`)
    }

    const geoJSON: GeoJSONData = await response.json()
    
    if (!geoJSON.features || geoJSON.features.length === 0) {
      throw new Error('No features found in GeoJSON')
    }

    const coordinates = extractCoordinates(geoJSON.features[0].geometry)
    
    return normalizeCoordinates(coordinates)
  } catch (error) {
    console.error(`Error fetching circuit ${circuitId}:`, error)
    return []
  }
}

export async function fetchAllCircuits(circuitIds: string[]): Promise<Record<string, Point[]>> {
  const results: Record<string, Point[]> = {}
  
  await Promise.all(
    circuitIds.map(async (id) => {
      const layout = await fetchCircuitGeoJSON(id)
      if (layout.length > 0) {
        results[id] = layout
      }
    })
  )
  
  return results
}
