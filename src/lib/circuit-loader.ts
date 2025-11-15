import { Circuit } from './circuits'
import { CircuitBase } from '@/data/circuit-types'
import circuitsDataRaw from '@/data/circuits.json'
import { WIKIPEDIA_MAPPING } from '@/data/wikipedia-mapping'

const circuitsData = circuitsDataRaw as CircuitBase[]

interface WikiData {
  facts: string[]
  length?: string
  lapRecord?: string
  firstGP?: string
  corners?: number
}

export async function fetchWikipediaData(
  wikipediaTitle: string,
  onProgress?: (progress: number) => void
): Promise<WikiData> {
  try {
    onProgress?.(0.2)
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikipediaTitle)}`
    const summaryResponse = await fetch(summaryUrl)
    
    onProgress?.(0.5)
    
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
    
    onProgress?.(0.7)
    
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

    onProgress?.(1)

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

export function loadAllCircuits(): Circuit[] {
  return circuitsData.map(circuit => ({
    ...circuit,
    facts: [],
    length: 'Loading...',
    lapRecord: undefined,
    firstGP: undefined,
    corners: 0
  }))
}

export async function loadCircuitWithWikipedia(
  circuitId: string,
  onProgress?: (progress: number) => void
): Promise<Circuit | null> {
  const circuitBase = circuitsData.find(c => c.id === circuitId)
  if (!circuitBase) {
    return null
  }

  const wikiTitle = WIKIPEDIA_MAPPING[circuitId]
  if (!wikiTitle) {
    return {
      ...circuitBase,
      facts: ['Information not available'],
      length: 'N/A',
      corners: 0
    }
  }

  const wikiData = await fetchWikipediaData(wikiTitle, onProgress)

  return {
    ...circuitBase,
    facts: wikiData.facts,
    length: wikiData.length || 'N/A',
    lapRecord: wikiData.lapRecord,
    firstGP: wikiData.firstGP,
    corners: wikiData.corners || 0
  }
}
