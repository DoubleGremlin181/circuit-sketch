import { Circuit } from './circuits'
import { scrapeWikipediaData } from './wikipedia-scraper'

interface GeoJSONGeometry {
  type: string
  coordinates: number[][] | number[][][]
}

interface GeoJSONFeature {
  type: string
  properties: {
    Name?: string
    name?: string
    [key: string]: any
  }
  geometry: GeoJSONGeometry
}

interface GeoJSONCollection {
  type: string
  features: GeoJSONFeature[]
}

interface CircuitBasicInfo {
  name: string
  location: string
  country: string
}

const GITHUB_API_BASE = 'https://api.github.com/repos/bacinger/f1-circuits/contents/circuits'

const circuitBasicInfo: Record<string, CircuitBasicInfo & { 
  length?: string
  corners?: number
  firstGP?: string
  facts?: string[]
}> = {
  'albert-park': {
    name: 'Albert Park Circuit',
    location: 'Melbourne, Australia',
    country: 'Australia',
    length: '5.278 km',
    corners: 14,
    firstGP: '1996',
    facts: [
      'Street circuit using public roads around Albert Park Lake',
      'Known for its fast, flowing layout with high average speeds',
      'Features a mix of tight corners and fast straights'
    ]
  },
  'americas': {
    name: 'Circuit of the Americas',
    location: 'Austin, Texas, USA',
    country: 'United States',
    length: '5.513 km',
    corners: 20,
    firstGP: '2012',
    facts: [
      'First purpose-built F1 circuit in the United States',
      'Features dramatic elevation changes including the iconic Turn 1 climb',
      'Known for its challenging layout inspired by classic circuits'
    ]
  },
  'bahrain': {
    name: 'Bahrain International Circuit',
    location: 'Sakhir, Bahrain',
    country: 'Bahrain',
    length: '5.412 km',
    corners: 15,
    firstGP: '2004',
    facts: [
      'First Formula 1 race in the Middle East',
      'Desert circuit with modern facilities and floodlight capabilities',
      'Features long straights and heavy braking zones'
    ]
  },
  'baku': {
    name: 'Baku City Circuit',
    location: 'Baku, Azerbaijan',
    country: 'Azerbaijan',
    length: '6.003 km',
    corners: 20,
    firstGP: '2016',
    facts: [
      'One of the fastest street circuits in Formula 1',
      'Features the longest straight in F1 at over 2 kilometers',
      'Runs through the historic old town and modern waterfront'
    ]
  },
  'catalunya': {
    name: 'Circuit de Barcelona-Catalunya',
    location: 'Barcelona, Spain',
    country: 'Spain',
    length: '4.675 km',
    corners: 16,
    firstGP: '1991',
    facts: [
      'Primary pre-season testing venue for Formula 1 teams',
      'Known for its technical layout testing all aspects of car performance',
      'Features a challenging mix of high and low-speed corners'
    ]
  },
  'hockenheim': {
    name: 'Hockenheimring',
    location: 'Hockenheim, Germany',
    country: 'Germany',
    length: '4.574 km',
    corners: 17,
    firstGP: '1970',
    facts: [
      'Historic German circuit with a rich Formula 1 heritage',
      'Known for its stadium section with grandstands',
      'Features a mix of fast straights and technical corners'
    ]
  },
  'hungaroring': {
    name: 'Hungaroring',
    location: 'Budapest, Hungary',
    country: 'Hungary',
    length: '4.381 km',
    corners: 14,
    firstGP: '1986',
    facts: [
      'First Formula 1 race behind the Iron Curtain',
      'Tight and twisty layout often compared to a go-kart track',
      'Known for difficult overtaking and strategic racing'
    ]
  },
  'imola': {
    name: 'Autodromo Enzo e Dino Ferrari',
    location: 'Imola, Italy',
    country: 'Italy',
    length: '4.909 km',
    corners: 19,
    firstGP: '1980',
    facts: [
      'Historic circuit named after Enzo Ferrari and his son Dino',
      'Features challenging corners including Tamburello and Variante Alta',
      'Known for passionate Italian fans and dramatic races'
    ]
  },
  'interlagos': {
    name: 'Autódromo José Carlos Pace',
    location: 'São Paulo, Brazil',
    country: 'Brazil',
    length: '4.309 km',
    corners: 15,
    firstGP: '1973',
    facts: [
      'Runs counter-clockwise, one of few F1 circuits to do so',
      'Features significant elevation changes and flowing corners',
      'Known for unpredictable weather and passionate Brazilian fans'
    ]
  },
  'jeddah': {
    name: 'Jeddah Corniche Circuit',
    location: 'Jeddah, Saudi Arabia',
    country: 'Saudi Arabia',
    length: '6.174 km',
    corners: 27,
    firstGP: '2021',
    facts: [
      'Fastest street circuit in Formula 1 with average speeds over 250 km/h',
      'Features high-speed corners and minimal run-off areas',
      'Runs along the Red Sea waterfront with stunning views'
    ]
  },
  'marina-bay': {
    name: 'Marina Bay Street Circuit',
    location: 'Singapore',
    country: 'Singapore',
    length: '4.940 km',
    corners: 19,
    firstGP: '2008',
    facts: [
      'First night race in Formula 1 history',
      'Bumpy street circuit with tight corners and barriers',
      'Known for high humidity and challenging physical conditions'
    ]
  },
  'miami': {
    name: 'Miami International Autodrome',
    location: 'Miami, Florida, USA',
    country: 'United States',
    length: '5.412 km',
    corners: 19,
    firstGP: '2022',
    facts: [
      'Purpose-built circuit around Hard Rock Stadium',
      'Features a complex of corners and a long straight',
      'Known for its entertainment and party atmosphere'
    ]
  },
  'monaco': {
    name: 'Circuit de Monaco',
    location: 'Monte Carlo, Monaco',
    country: 'Monaco',
    length: '3.337 km',
    corners: 19,
    firstGP: '1950',
    facts: [
      'Most prestigious and iconic race on the Formula 1 calendar',
      'Narrow street circuit with minimal room for error',
      'Winning here is considered the pinnacle of racing achievement'
    ]
  },
  'monza': {
    name: 'Autodromo Nazionale di Monza',
    location: 'Monza, Italy',
    country: 'Italy',
    length: '5.793 km',
    corners: 11,
    firstGP: '1950',
    facts: [
      'Fastest circuit in Formula 1 known as the Temple of Speed',
      'Features long straights and historic banked sections',
      'Home of the passionate Italian Tifosi Ferrari fans'
    ]
  },
  'red-bull-ring': {
    name: 'Red Bull Ring',
    location: 'Spielberg, Austria',
    country: 'Austria',
    length: '4.318 km',
    corners: 10,
    firstGP: '1970',
    facts: [
      'Shortest lap on the Formula 1 calendar',
      'Set in the scenic Styrian mountains with dramatic elevation',
      'Known for its fast, flowing layout and overtaking opportunities'
    ]
  },
  'ricard': {
    name: 'Circuit Paul Ricard',
    location: 'Le Castellet, France',
    country: 'France',
    length: '5.842 km',
    corners: 15,
    firstGP: '1971',
    facts: [
      'Distinctive blue and red run-off areas for safety',
      'Features the long Mistral straight with heavy braking',
      'Known for its technical layout and hot Mediterranean climate'
    ]
  },
  'rodriguez': {
    name: 'Autódromo Hermanos Rodríguez',
    location: 'Mexico City, Mexico',
    country: 'Mexico',
    length: '4.304 km',
    corners: 17,
    firstGP: '1963',
    facts: [
      'Highest altitude circuit in Formula 1 at 2,200 meters',
      'Thin air affects engine performance and aerodynamics',
      'Features the iconic Peraltada corner and stadium section'
    ]
  },
  'sakhir': {
    name: 'Bahrain International Circuit (Outer)',
    location: 'Sakhir, Bahrain',
    country: 'Bahrain',
    length: '3.543 km',
    corners: 11,
    firstGP: '2020',
    facts: [
      'Outer layout used for the Sakhir Grand Prix',
      'One of the fastest lap times in Formula 1',
      'Features primarily low-speed corners with long straights'
    ]
  },
  'saudi-arabia': {
    name: 'Jeddah Corniche Circuit',
    location: 'Jeddah, Saudi Arabia',
    country: 'Saudi Arabia',
    length: '6.174 km',
    corners: 27,
    firstGP: '2021',
    facts: [
      'Fastest street circuit in Formula 1',
      'Features blind corners and high-speed sections',
      'Lit by floodlights for night racing'
    ]
  },
  'shanghai': {
    name: 'Shanghai International Circuit',
    location: 'Shanghai, China',
    country: 'China',
    length: '5.451 km',
    corners: 16,
    firstGP: '2004',
    facts: [
      'Features a unique snail-shaped Turn 1 complex',
      'Long back straight providing overtaking opportunities',
      'Known for unpredictable weather conditions'
    ]
  },
  'silverstone': {
    name: 'Silverstone Circuit',
    location: 'Silverstone, England',
    country: 'United Kingdom',
    length: '5.891 km',
    corners: 18,
    firstGP: '1950',
    facts: [
      'Hosted the very first Formula 1 World Championship race',
      'Former RAF airfield with fast, flowing corners',
      'Known for high-speed sections like Maggotts and Becketts'
    ]
  },
  'sochi': {
    name: 'Sochi Autodrom',
    location: 'Sochi, Russia',
    country: 'Russia',
    length: '5.848 km',
    corners: 18,
    firstGP: '2014',
    facts: [
      'Built around the 2014 Winter Olympics venue',
      'Features a long main straight and tight technical sections',
      'Known for its blend of street circuit and permanent track'
    ]
  },
  'spa': {
    name: 'Circuit de Spa-Francorchamps',
    location: 'Spa, Belgium',
    country: 'Belgium',
    length: '7.004 km',
    corners: 19,
    firstGP: '1950',
    facts: [
      'Longest circuit on the Formula 1 calendar',
      'Features the famous Eau Rouge and Raidillon uphill complex',
      'Known for unpredictable weather and challenging elevation changes'
    ]
  },
  'suzuka': {
    name: 'Suzuka International Racing Course',
    location: 'Suzuka, Japan',
    country: 'Japan',
    length: '5.807 km',
    corners: 18,
    firstGP: '1987',
    facts: [
      'Only figure-eight circuit in Formula 1',
      'Features the legendary 130R corner and challenging Spoon Curve',
      'Designed by legendary driver Soichiro Honda'
    ]
  },
  'vegas': {
    name: 'Las Vegas Street Circuit',
    location: 'Las Vegas, Nevada, USA',
    country: 'United States',
    length: '6.120 km',
    corners: 17,
    firstGP: '2023',
    facts: [
      'Features the famous Las Vegas Strip as part of the circuit',
      'Night race with spectacular neon-lit surroundings',
      'Includes a long straight along the Strip exceeding 2 km'
    ]
  },
  'villeneuve': {
    name: 'Circuit Gilles Villeneuve',
    location: 'Montreal, Canada',
    country: 'Canada',
    length: '4.361 km',
    corners: 14,
    firstGP: '1978',
    facts: [
      'Located on Île Notre-Dame in the St. Lawrence River',
      'Features the famous Wall of Champions catching out many drivers',
      'Known for its combination of straights and chicanes'
    ]
  },
  'yas-marina': {
    name: 'Yas Marina Circuit',
    location: 'Abu Dhabi, UAE',
    country: 'United Arab Emirates',
    length: '5.281 km',
    corners: 16,
    firstGP: '2009',
    facts: [
      'Twilight race transitioning from day to night',
      'Features a stunning marina and Yas Hotel overlooking the track',
      'Known for its tight technical sections and long straights'
    ]
  },
  'zandvoort': {
    name: 'Circuit Zandvoort',
    location: 'Zandvoort, Netherlands',
    country: 'Netherlands',
    length: '4.259 km',
    corners: 14,
    firstGP: '1952',
    facts: [
      'Historic seaside circuit in the sand dunes',
      'Features heavily banked corners added for modern F1',
      'Known for its passionate Dutch fans supporting Max Verstappen'
    ]
  }
}

function projectTo2D(lon: number, lat: number, bounds: { minLon: number; maxLon: number; minLat: number; maxLat: number }): { x: number; y: number } {
  const x = (lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)
  const y = 1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)
  
  return { x, y }
}

function extractCoordinates(geometry: GeoJSONGeometry): number[][] {
  if (geometry.type === 'LineString') {
    return geometry.coordinates as number[][]
  } else if (geometry.type === 'Polygon') {
    return (geometry.coordinates as number[][][])[0]
  } else if (geometry.type === 'MultiLineString') {
    return (geometry.coordinates as number[][][]).flat()
  }
  return []
}

function getBounds(coords: number[][]): { minLon: number; maxLon: number; minLat: number; maxLat: number } {
  const lons = coords.map(c => c[0])
  const lats = coords.map(c => c[1])
  
  return {
    minLon: Math.min(...lons),
    maxLon: Math.max(...lons),
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats)
  }
}

async function parseGeoJSON(geojson: GeoJSONCollection, circuitId: string): Promise<Circuit | null> {
  if (!geojson.features || geojson.features.length === 0) {
    return null
  }

  const feature = geojson.features[0]
  const coords = extractCoordinates(feature.geometry)
  
  if (coords.length < 3) {
    return null
  }

  const bounds = getBounds(coords)
  const layout = coords.map(coord => projectTo2D(coord[0], coord[1], bounds))

  const basicInfo = circuitBasicInfo[circuitId] || {
    name: feature.properties?.Name || feature.properties?.name || circuitId,
    location: 'Unknown',
    country: 'Unknown',
    facts: ['Formula 1 racing circuit']
  }

  console.log(`Fetching Wikipedia data for ${circuitId}...`)
  const wikiData = await scrapeWikipediaData(circuitId)
  console.log(`Wikipedia data for ${circuitId}:`, wikiData)

  return {
    id: circuitId,
    name: basicInfo.name,
    location: basicInfo.location,
    country: basicInfo.country,
    layout,
    facts: wikiData.facts.length > 0 ? wikiData.facts : (basicInfo.facts || ['Formula 1 racing circuit']),
    length: wikiData.length || basicInfo.length || 'Unknown',
    lapRecord: wikiData.lapRecord,
    firstGP: wikiData.firstGP || basicInfo.firstGP,
    corners: wikiData.corners || basicInfo.corners || Math.max(10, Math.floor(layout.length / 10)),
    totalRaces: wikiData.totalRaces,
    yearRange: wikiData.yearRange,
    mostWins: wikiData.mostWins
  }
}

export async function loadCircuitFromGitHub(circuitId: string): Promise<Circuit | null> {
  const branches = ['main', 'master']
  
  for (const branch of branches) {
    try {
      const url = `https://raw.githubusercontent.com/bacinger/f1-circuits/${branch}/circuits/${circuitId}.geojson`
      console.log(`Attempting to load circuit from: ${url}`)
      const response = await fetch(url)
      
      if (!response.ok) {
        console.warn(`Failed to load circuit ${circuitId} from ${branch}: ${response.status} ${response.statusText}`)
        continue
      }

      const geojson = await response.json() as GeoJSONCollection
      const circuit = await parseGeoJSON(geojson, circuitId)
      if (circuit) {
        console.log(`Successfully loaded circuit: ${circuitId} from branch ${branch}`)
        return circuit
      }
    } catch (error) {
      console.error(`Error loading circuit ${circuitId} from ${branch}:`, error)
    }
  }
  
  console.error(`Failed to load circuit ${circuitId} from all branches`)
  return null
}

async function discoverAvailableCircuits(): Promise<string[]> {
  try {
    console.log('Discovering available circuits from GitHub...')
    const response = await fetch(GITHUB_API_BASE)
    
    if (!response.ok) {
      console.warn('Failed to discover circuits from GitHub API')
      return []
    }
    
    const files = await response.json() as Array<{ name: string; type: string }>
    const geojsonFiles = files
      .filter(file => file.type === 'file' && file.name.endsWith('.geojson'))
      .map(file => file.name.replace('.geojson', ''))
    
    console.log(`Discovered ${geojsonFiles.length} circuits:`, geojsonFiles)
    return geojsonFiles
  } catch (error) {
    console.error('Error discovering circuits:', error)
    return []
  }
}

export async function loadAllCircuitsFromGitHub(): Promise<Circuit[]> {
  console.log('Starting circuit loading process...')
  
  const availableCircuits = await discoverAvailableCircuits()
  
  let circuitIdsToLoad: string[]
  
  if (availableCircuits.length > 0) {
    console.log(`Using discovered circuits from GitHub: ${availableCircuits.length} found`)
    circuitIdsToLoad = availableCircuits
  } else {
    console.log('Circuit discovery failed, using predefined list')
    circuitIdsToLoad = Object.keys(circuitBasicInfo)
  }
  
  console.log(`Attempting to load ${circuitIdsToLoad.length} circuits...`)
  
  const results = await Promise.allSettled(
    circuitIdsToLoad.map(id => loadCircuitFromGitHub(id))
  )

  const loadedCircuits = results
    .filter((result): result is PromiseFulfilledResult<Circuit | null> => 
      result.status === 'fulfilled' && result.value !== null
    )
    .map(result => result.value as Circuit)
  
  console.log(`Successfully loaded ${loadedCircuits.length} circuits from GitHub`)
  
  if (loadedCircuits.length === 0) {
    console.error('Failed to load any circuits. Possible reasons:')
    console.error('- GitHub repo structure has changed')
    console.error('- Network/CORS issues')
    console.error('- Branch name is incorrect')
    throw new Error('No circuits could be loaded from GitHub')
  }
  
  return loadedCircuits
}
