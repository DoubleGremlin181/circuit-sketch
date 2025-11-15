import { Circuit } from './circuits'

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

interface CircuitMetadata {
  name: string
  location: string
  country: string
  facts: string[]
  length?: string
  lapRecord?: string
  firstGP?: string
  corners?: number
}

const GITHUB_API_BASE = 'https://api.github.com/repos/bacinger/f1-circuits/contents/circuits'
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/bacinger/f1-circuits/main/circuits'

const circuitMetadata: Record<string, CircuitMetadata> = {
  'albert-park': {
    name: 'Albert Park Circuit',
    location: 'Melbourne, Australia',
    country: 'Australia',
    facts: [
      'Street circuit located around Albert Park Lake',
      'Home of the Australian Grand Prix since 1996',
      'One of the fastest street circuits on the calendar',
      'Features semi-permanent track facilities',
      'Known for unpredictable weather conditions'
    ],
    length: '5.278 km',
    corners: 14
  },
  'americas': {
    name: 'Circuit of the Americas',
    location: 'Austin, Texas, USA',
    country: 'United States',
    facts: [
      'First purpose-built F1 circuit in the United States',
      'Turn 1 is one of the steepest uphill climbs in F1',
      'Designed by Hermann Tilke with inspiration from classic circuits',
      'Features a 251-foot observation tower',
      'Hosts the United States Grand Prix since 2012'
    ],
    length: '5.513 km',
    corners: 20
  },
  'bahrain': {
    name: 'Bahrain International Circuit',
    location: 'Sakhir, Bahrain',
    country: 'Bahrain',
    facts: [
      'First F1 circuit in the Middle East',
      'Famous for night racing under floodlights',
      'Built on desert land, creating unique challenges',
      'Multiple layout configurations available',
      'Hosts extensive F1 pre-season testing'
    ],
    length: '5.412 km',
    corners: 15
  },
  'baku': {
    name: 'Baku City Circuit',
    location: 'Baku, Azerbaijan',
    country: 'Azerbaijan',
    facts: [
      'One of the fastest street circuits in the world',
      'Features the longest straight in F1 at 2.2 km',
      'Runs through the historic Old Town of Baku',
      'Known for dramatic racing and safety car periods',
      'Tight castle section contrasts with high-speed straights'
    ],
    length: '6.003 km',
    corners: 20
  },
  'catalunya': {
    name: 'Circuit de Barcelona-Catalunya',
    location: 'Barcelona, Spain',
    country: 'Spain',
    facts: [
      'Primary venue for F1 pre-season testing',
      'All teams know this track extremely well',
      'Challenging combination of high and low-speed corners',
      'Modified in 2023 to improve overtaking opportunities',
      'Hosts the Spanish Grand Prix'
    ],
    length: '4.675 km',
    corners: 16
  },
  'hockenheim': {
    name: 'Hockenheimring',
    location: 'Hockenheim, Germany',
    country: 'Germany',
    facts: [
      'Originally featured long straights through forests',
      'Redesigned in 2002 for better spectator viewing',
      'Home of the German Grand Prix',
      'Known for hot summer temperatures',
      'Historic venue with rich motorsport heritage'
    ],
    length: '4.574 km',
    corners: 17
  },
  'hungaroring': {
    name: 'Hungaroring',
    location: 'Budapest, Hungary',
    country: 'Hungary',
    facts: [
      'First F1 race behind the Iron Curtain in 1986',
      'Twisty, low-speed circuit often compared to Monaco',
      'Difficult to overtake, qualifying position is crucial',
      'Dusty surface off-line creates unique challenges',
      '热summer temperatures test driver endurance'
    ],
    length: '4.381 km',
    corners: 14
  },
  'imola': {
    name: 'Autodromo Enzo e Dino Ferrari',
    location: 'Imola, Italy',
    country: 'Italy',
    facts: [
      'Named after Enzo Ferrari and his son Dino',
      'Historic circuit with passionate Italian fans',
      'Site of tragic 1994 San Marino Grand Prix',
      'Challenging old-school layout with fast corners',
      'Returned to the F1 calendar in 2020'
    ],
    length: '4.909 km',
    corners: 19
  },
  'interlagos': {
    name: 'Autódromo José Carlos Pace',
    location: 'São Paulo, Brazil',
    country: 'Brazil',
    facts: [
      'Run counter-clockwise, one of only a few circuits with this direction',
      'Named after Brazilian F1 driver José Carlos Pace',
      'Scene of many dramatic championship deciders',
      'Significant elevation changes make it physically demanding',
      'The passionate Brazilian crowd creates an electric atmosphere'
    ],
    length: '4.309 km',
    corners: 15
  },
  'jeddah': {
    name: 'Jeddah Corniche Circuit',
    location: 'Jeddah, Saudi Arabia',
    country: 'Saudi Arabia',
    facts: [
      'Fastest street circuit in the world',
      'Features 27 corners and high-speed sections',
      'Night race along the Red Sea coast',
      'Barrier-lined with minimal run-off areas',
      'Debuted in 2021 as part of Saudi Arabian Grand Prix'
    ],
    length: '6.174 km',
    corners: 27
  },
  'marina-bay': {
    name: 'Marina Bay Street Circuit',
    location: 'Singapore',
    country: 'Singapore',
    facts: [
      'First night race in F1 history',
      'Bumpy street circuit around Marina Bay',
      'High humidity and heat challenge drivers',
      'Stunning cityscape backdrop',
      'Safety car appearances are common'
    ],
    length: '4.940 km',
    corners: 19
  },
  'miami': {
    name: 'Miami International Autodrome',
    location: 'Miami, Florida, USA',
    country: 'United States',
    facts: [
      'Built around Hard Rock Stadium',
      'Features artificial marina and beach club',
      'Fast corners and long straights',
      'Debuted in 2022 as part of Miami Grand Prix',
      'Part of F1\'s expansion in the United States'
    ],
    length: '5.412 km',
    corners: 19
  },
  'monaco': {
    name: 'Circuit de Monaco',
    location: 'Monte Carlo, Monaco',
    country: 'Monaco',
    facts: [
      'The most prestigious race in F1',
      'Slowest track but most demanding on concentration',
      'Virtually unchanged since 1929',
      'Ayrton Senna won here 6 times',
      'The Swimming Pool complex is iconic'
    ],
    length: '3.337 km',
    corners: 19
  },
  'monza': {
    name: 'Autodromo Nazionale di Monza',
    location: 'Monza, Italy',
    country: 'Italy',
    facts: [
      'Known as the "Temple of Speed"',
      'Fastest track in F1 with high average speeds',
      'Home to the legendary Tifosi',
      'Features historic banked curves from 1922',
      'Located in a royal park near Milan'
    ],
    length: '5.793 km',
    corners: 11
  },
  'red-bull-ring': {
    name: 'Red Bull Ring',
    location: 'Spielberg, Austria',
    country: 'Austria',
    facts: [
      'Shortest lap on the F1 calendar',
      'Set in the Styrian mountains',
      'Only 10 corners but extremely challenging',
      'Steep elevation changes throughout',
      'Stunning alpine scenery surrounds the track'
    ],
    length: '4.318 km',
    corners: 10
  },
  'ricard': {
    name: 'Circuit Paul Ricard',
    location: 'Le Castellet, France',
    country: 'France',
    facts: [
      'Famous for distinctive blue and red run-off areas',
      'Mistral Straight is one of the longest in F1',
      'Extensive run-off areas for safety',
      'Used as a major testing facility',
      'Returned to F1 calendar in 2018'
    ],
    length: '5.842 km',
    corners: 15
  },
  'rodriguez': {
    name: 'Autódromo Hermanos Rodríguez',
    location: 'Mexico City, Mexico',
    country: 'Mexico',
    facts: [
      'High altitude (2,200m) reduces engine power',
      'Thin air affects aerodynamics and cooling',
      'Named after Rodriguez brothers, both racing drivers',
      'Passionate Mexican fans create incredible atmosphere',
      'Peraltada corner is one of the most challenging'
    ],
    length: '4.304 km',
    corners: 17
  },
  'sakhir': {
    name: 'Bahrain International Circuit (Outer)',
    location: 'Sakhir, Bahrain',
    country: 'Bahrain',
    facts: [
      'Alternative "Outer" layout used for special events',
      'Features extremely long back straight',
      'Used for the 2020 Sakhir Grand Prix',
      'Ultra-fast lap times under 55 seconds',
      'Tests car setup differently than main layout'
    ],
    length: '3.543 km',
    corners: 11
  },
  'saudi-arabia': {
    name: 'Jeddah Corniche Circuit',
    location: 'Jeddah, Saudi Arabia',
    country: 'Saudi Arabia',
    facts: [
      'Fastest street circuit in the world',
      'Features 27 corners and high-speed sections',
      'Night race along the Red Sea coast',
      'Barrier-lined with minimal run-off areas',
      'Debuted in 2021'
    ],
    length: '6.174 km',
    corners: 27
  },
  'shanghai': {
    name: 'Shanghai International Circuit',
    location: 'Shanghai, China',
    country: 'China',
    facts: [
      'Designed to resemble the Chinese character "shang"',
      'Extremely long back straight for overtaking',
      'Unique snail-shaped Turn 1-2-3 complex',
      'Hosted Chinese Grand Prix since 2004',
      'Can experience all four seasons in one day'
    ],
    length: '5.451 km',
    corners: 16
  },
  'silverstone': {
    name: 'Silverstone Circuit',
    location: 'Silverstone, England',
    country: 'United Kingdom',
    facts: [
      'Home of British Grand Prix and birthplace of F1',
      'Built on a former RAF bomber station',
      'Copse, Maggotts, and Becketts are iconic fast corners',
      'Lewis Hamilton has won here a record 8 times',
      'Hosts over 140,000 fans on race day'
    ],
    length: '5.891 km',
    corners: 18
  },
  'sochi': {
    name: 'Sochi Autodrom',
    location: 'Sochi, Russia',
    country: 'Russia',
    facts: [
      'Built around 2014 Winter Olympics venue',
      'Long, fast corners around Olympic Park',
      'Challenging Turn 3 tests bravery',
      'Hosted Russian Grand Prix 2014-2021',
      'No longer on the F1 calendar'
    ],
    length: '5.848 km',
    corners: 18
  },
  'spa': {
    name: 'Circuit de Spa-Francorchamps',
    location: 'Spa, Belgium',
    country: 'Belgium',
    facts: [
      'Longest track on the F1 calendar',
      'Infamous for unpredictable weather',
      'Eau Rouge-Raidillon is one of the most feared corners',
      'Michael Schumacher\'s first F1 victory in 1992',
      '100 meters of elevation change'
    ],
    length: '7.004 km',
    corners: 19
  },
  'suzuka': {
    name: 'Suzuka International Racing Course',
    location: 'Suzuka, Japan',
    country: 'Japan',
    facts: [
      'Only figure-eight circuit on the calendar',
      'Designed by Dutch legend John Hugenholtz',
      'The 130R corner is one of the fastest',
      'Famous Senna-Prost collisions in 1989 and 1990',
      'Enthusiastic fans create incredible grandstand displays'
    ],
    length: '5.807 km',
    corners: 18
  },
  'vegas': {
    name: 'Las Vegas Street Circuit',
    location: 'Las Vegas, Nevada, USA',
    country: 'United States',
    facts: [
      'Night race through the Las Vegas Strip',
      'Features iconic landmarks like the Sphere',
      'Long straights with high top speeds',
      'Saturday night race for prime entertainment value',
      'Debuted in 2023 as part of Las Vegas Grand Prix'
    ],
    length: '6.120 km',
    corners: 17
  },
  'villeneuve': {
    name: 'Circuit Gilles Villeneuve',
    location: 'Montreal, Canada',
    country: 'Canada',
    facts: [
      'Named after legendary Canadian driver Gilles Villeneuve',
      'Semi-permanent circuit on Île Notre-Dame',
      'Wall of Champions claims many victims',
      'High-speed straights and heavy braking zones',
      'Hosts the Canadian Grand Prix'
    ],
    length: '4.361 km',
    corners: 14
  },
  'yas-marina': {
    name: 'Yas Marina Circuit',
    location: 'Abu Dhabi, UAE',
    country: 'United Arab Emirates',
    facts: [
      'Twilight race with stunning lighting transition',
      'Features the iconic Yas Hotel bridge',
      'Multiple track configuration options',
      'Often hosts the season finale',
      'Redesigned in 2021 to improve racing'
    ],
    length: '5.281 km',
    corners: 16
  },
  'zandvoort': {
    name: 'Circuit Zandvoort',
    location: 'Zandvoort, Netherlands',
    country: 'Netherlands',
    facts: [
      'Historic seaside circuit returned to F1 in 2021',
      'Features heavily banked corners added for F1 return',
      'Narrow track makes overtaking challenging',
      'Orange Army of Dutch fans creates electric atmosphere',
      'Close to beach dunes in coastal setting'
    ],
    length: '4.259 km',
    corners: 14
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

function parseGeoJSON(geojson: GeoJSONCollection, circuitId: string): Circuit | null {
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

  const metadata = circuitMetadata[circuitId] || {
    name: feature.properties?.Name || feature.properties?.name || circuitId,
    location: 'Unknown',
    country: 'Unknown',
    facts: ['F1 racing circuit']
  }

  return {
    id: circuitId,
    name: metadata.name,
    location: metadata.location,
    country: metadata.country,
    layout,
    facts: metadata.facts,
    length: metadata.length || 'Unknown',
    lapRecord: metadata.lapRecord,
    firstGP: metadata.firstGP,
    corners: metadata.corners || layout.length
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
      const circuit = parseGeoJSON(geojson, circuitId)
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
    circuitIdsToLoad = Object.keys(circuitMetadata)
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
