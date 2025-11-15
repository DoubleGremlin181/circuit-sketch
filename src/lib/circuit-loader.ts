import { Circuit } from './circuits'

const CIRCUITS_REPO_BASE = 'https://raw.githubusercontent.com/bacinger/f1-circuits/master/circuits'

export interface CircuitData {
  name: string
  location: string
  country: string
  layout: { x: number; y: number }[]
  wikipediaUrl?: string
}

const CIRCUIT_MAPPING = [
  { id: 'albert_park', name: 'Albert Park Circuit', country: 'Australia', location: 'Melbourne, Australia', wiki: 'Melbourne_Grand_Prix_Circuit' },
  { id: 'americas', name: 'Circuit of the Americas', country: 'USA', location: 'Austin, Texas', wiki: 'Circuit_of_the_Americas' },
  { id: 'bahrain', name: 'Bahrain International Circuit', country: 'Bahrain', location: 'Sakhir, Bahrain', wiki: 'Bahrain_International_Circuit' },
  { id: 'baku', name: 'Baku City Circuit', country: 'Azerbaijan', location: 'Baku, Azerbaijan', wiki: 'Baku_City_Circuit' },
  { id: 'catalunya', name: 'Circuit de Barcelona-Catalunya', country: 'Spain', location: 'Barcelona, Spain', wiki: 'Circuit_de_Barcelona-Catalunya' },
  { id: 'hockenheimring', name: 'Hockenheimring', country: 'Germany', location: 'Hockenheim, Germany', wiki: 'Hockenheimring' },
  { id: 'hungaroring', name: 'Hungaroring', country: 'Hungary', location: 'Budapest, Hungary', wiki: 'Hungaroring' },
  { id: 'imola', name: 'Autodromo Enzo e Dino Ferrari', country: 'Italy', location: 'Imola, Italy', wiki: 'Imola_Circuit' },
  { id: 'interlagos', name: 'Autódromo José Carlos Pace', country: 'Brazil', location: 'São Paulo, Brazil', wiki: 'Autódromo_José_Carlos_Pace' },
  { id: 'jeddah', name: 'Jeddah Corniche Circuit', country: 'Saudi Arabia', location: 'Jeddah, Saudi Arabia', wiki: 'Jeddah_Street_Circuit' },
  { id: 'marina_bay', name: 'Marina Bay Street Circuit', country: 'Singapore', location: 'Singapore', wiki: 'Marina_Bay_Street_Circuit' },
  { id: 'miami', name: 'Miami International Autodrome', country: 'USA', location: 'Miami, Florida', wiki: 'Miami_International_Autodrome' },
  { id: 'monaco', name: 'Circuit de Monaco', country: 'Monaco', location: 'Monte Carlo, Monaco', wiki: 'Circuit_de_Monaco' },
  { id: 'monza', name: 'Autodromo Nazionale di Monza', country: 'Italy', location: 'Monza, Italy', wiki: 'Monza_Circuit' },
  { id: 'red_bull_ring', name: 'Red Bull Ring', country: 'Austria', location: 'Spielberg, Austria', wiki: 'Red_Bull_Ring' },
  { id: 'rodriguez', name: 'Autódromo Hermanos Rodríguez', country: 'Mexico', location: 'Mexico City, Mexico', wiki: 'Autódromo_Hermanos_Rodríguez' },
  { id: 'saudi_arabia', name: 'Jeddah Corniche Circuit', country: 'Saudi Arabia', location: 'Jeddah, Saudi Arabia', wiki: 'Jeddah_Street_Circuit' },
  { id: 'shanghai', name: 'Shanghai International Circuit', country: 'China', location: 'Shanghai, China', wiki: 'Shanghai_International_Circuit' },
  { id: 'silverstone', name: 'Silverstone Circuit', country: 'United Kingdom', location: 'Silverstone, England', wiki: 'Silverstone_Circuit' },
  { id: 'spa', name: 'Circuit de Spa-Francorchamps', country: 'Belgium', location: 'Spa, Belgium', wiki: 'Circuit_de_Spa-Francorchamps' },
  { id: 'suzuka', name: 'Suzuka International Racing Course', country: 'Japan', location: 'Suzuka, Japan', wiki: 'Suzuka_Circuit' },
  { id: 'vegas', name: 'Las Vegas Street Circuit', country: 'USA', location: 'Las Vegas, Nevada', wiki: 'Las_Vegas_Grand_Prix' },
  { id: 'villeneuve', name: 'Circuit Gilles Villeneuve', country: 'Canada', location: 'Montreal, Canada', wiki: 'Circuit_Gilles_Villeneuve' },
  { id: 'yas_marina', name: 'Yas Marina Circuit', country: 'UAE', location: 'Abu Dhabi, UAE', wiki: 'Yas_Marina_Circuit' },
  { id: 'zandvoort', name: 'Circuit Zandvoort', country: 'Netherlands', location: 'Zandvoort, Netherlands', wiki: 'Circuit_Zandvoort' },
]

async function fetchCircuitLayout(circuitId: string): Promise<{ x: number; y: number }[]> {
  try {
    const response = await fetch(`${CIRCUITS_REPO_BASE}/${circuitId}.json`)
    if (!response.ok) {
      console.warn(`Failed to fetch circuit ${circuitId}:`, response.statusText)
      return []
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error loading circuit ${circuitId}:`, error)
    return []
  }
}

interface WikiData {
  facts: string[]
  length?: string
  lapRecord?: string
  firstGP?: string
  corners?: number
}

async function fetchWikipediaData(wikipediaTitle: string): Promise<WikiData> {
  try {
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikipediaTitle)}`
    const summaryResponse = await fetch(summaryUrl)
    
    if (!summaryResponse.ok) {
      console.warn(`Failed to fetch Wikipedia data for ${wikipediaTitle}`)
      return {
        facts: ['Information temporarily unavailable'],
        length: undefined,
        lapRecord: undefined,
        firstGP: undefined,
        corners: undefined
      }
    }

    const summaryData = await summaryResponse.json()
    
    const facts: string[] = []
    
    if (summaryData.extract) {
      const sentences = summaryData.extract
        .split(/\.\s+/)
        .filter((s: string) => s.length > 30 && !s.match(/^\d+$/))
        .map((s: string) => s.trim())
        .filter((s: string) => !s.toLowerCase().includes('coordinates') && !s.toLowerCase().includes('redirect'))
      
      const uniqueFacts = [...new Set(sentences)]
      facts.push(...uniqueFacts.slice(0, 5).map((s: string) => s.endsWith('.') ? s : s + '.'))
    }

    let additionalStats: Partial<WikiData> = {}
    
    try {
      const htmlUrl = `https://en.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(wikipediaTitle)}`
      const htmlResponse = await fetch(htmlUrl)
      
      if (htmlResponse.ok) {
        const html = await htmlResponse.text()
        
        const lengthMatch = html.match(/(?:circuit length|track length)[:\s]+([0-9.]+)\s*(?:km|kilometers)/i)
        if (lengthMatch) {
          additionalStats.length = `${lengthMatch[1]} km`
        }
        
        const cornersMatch = html.match(/(?:corners|turns)[:\s]+(\d+)/i)
        if (cornersMatch) {
          additionalStats.corners = parseInt(cornersMatch[1])
        }
        
        const firstGPMatch = html.match(/first\s+(?:grand\s+prix|race)[:\s]+(\d{4})/i)
        if (firstGPMatch) {
          additionalStats.firstGP = firstGPMatch[1]
        }
      }
    } catch (error) {
      console.warn('Could not fetch additional stats from Wikipedia HTML')
    }

    return {
      facts: facts.length > 0 ? facts : ['Racing circuit with rich Formula 1 history'],
      ...additionalStats
    }
  } catch (error) {
    console.error(`Error fetching Wikipedia data for ${wikipediaTitle}:`, error)
    return {
      facts: ['Information temporarily unavailable'],
      length: undefined,
      lapRecord: undefined,
      firstGP: undefined,
      corners: undefined
    }
  }
}

export async function loadCircuit(circuitId: string): Promise<Circuit | null> {
  const mapping = CIRCUIT_MAPPING.find(m => m.id === circuitId)
  if (!mapping) {
    console.warn(`No mapping found for circuit ${circuitId}`)
    return null
  }

  const [layout, wikiData] = await Promise.all([
    fetchCircuitLayout(circuitId),
    mapping.wiki ? fetchWikipediaData(mapping.wiki) : Promise.resolve({
      facts: [],
      length: undefined,
      lapRecord: undefined,
      firstGP: undefined,
      corners: undefined
    } as WikiData)
  ])

  if (layout.length === 0) {
    console.warn(`No layout data found for circuit ${circuitId}`)
    return null
  }

  return {
    id: circuitId,
    name: mapping.name,
    location: mapping.location,
    country: mapping.country,
    layout,
    facts: wikiData.facts,
    length: wikiData.length || 'N/A',
    lapRecord: wikiData.lapRecord,
    firstGP: wikiData.firstGP,
    corners: wikiData.corners || 0,
  }
}

export async function loadAllCircuits(): Promise<Circuit[]> {
  const circuitPromises = CIRCUIT_MAPPING.map(mapping => loadCircuit(mapping.id))
  const circuits = await Promise.all(circuitPromises)
  return circuits.filter((c): c is Circuit => c !== null)
}
