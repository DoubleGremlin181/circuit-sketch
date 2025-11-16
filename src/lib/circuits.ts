import circuitsRaw from '@/data/circuits.json'
import wikipediaRaw from '@/data/wikipedia-data.json'

export interface Circuit {
  id: string
  name: string
  location: string
  country: string
  layout: { x: number; y: number }[]
  facts: string[]
  length: string
  lapRecord?: string
  firstGP?: string
  corners: number
  totalRaces?: number
  yearRange?: string
  mostWins?: {
    driver: string
    wins: number
  }
  wikipediaUrl?: string
}

interface StoredCircuit {
  id: string
  name: string
  location: string
  country: string
  layout: { x: number; y: number }[]
}

interface StoredWikipediaData {
  facts: string[]
  length?: string
  lapRecord?: string
  firstGP?: string
  corners?: number
  totalRaces?: number
  yearRange?: string
  mostWins?: {
    driver: string
    wins: number
  }
  wikipediaUrl?: string
}

const wikipediaData = wikipediaRaw as Record<string, StoredWikipediaData>

function resolveWikiData(circuitId: string): StoredWikipediaData | undefined {
  if (wikipediaData[circuitId]) {
    return wikipediaData[circuitId]
  }

  const swappedHyphen = circuitId.includes('_') ? circuitId.replace(/_/g, '-') : undefined
  if (swappedHyphen && wikipediaData[swappedHyphen]) {
    return wikipediaData[swappedHyphen]
  }

  const swappedUnderscore = circuitId.includes('-') ? circuitId.replace(/-/g, '_') : undefined
  if (swappedUnderscore && wikipediaData[swappedUnderscore]) {
    return wikipediaData[swappedUnderscore]
  }

  return undefined
}

function buildCircuits(): Circuit[] {
  return (circuitsRaw as StoredCircuit[]).map(circuit => {
    const wiki = resolveWikiData(circuit.id)

    const facts = wiki?.facts?.length
      ? wiki.facts
      : ['Formula 1 racing circuit']

    const corners = wiki?.corners
      ?? Math.max(10, Math.floor(circuit.layout.length / 10))

    return {
      id: circuit.id,
      name: circuit.name,
      location: circuit.location,
      country: circuit.country,
      layout: circuit.layout,
      facts,
      length: wiki?.length || 'Unknown',
      lapRecord: wiki?.lapRecord,
      firstGP: wiki?.firstGP,
      corners,
      totalRaces: wiki?.totalRaces,
      yearRange: wiki?.yearRange,
      mostWins: wiki?.mostWins,
      wikipediaUrl: wiki?.wikipediaUrl
    }
  })
}

// Export circuits as a constant that can be imported directly
export const circuits: Circuit[] = buildCircuits()

