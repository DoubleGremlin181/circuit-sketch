import { WIKIPEDIA_MAPPING } from '@/data/wikipedia-mapping'

interface WikipediaData {
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
}

const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php'
const FETCH_TIMEOUT = 10000

async function fetchWithTimeout(url: string, timeout: number = FETCH_TIMEOUT): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(id)
    return response
  } catch (error) {
    clearTimeout(id)
    throw error
  }
}

async function fetchWikipediaContent(pageTitle: string): Promise<string> {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    titles: pageTitle,
    prop: 'extracts',
    explaintext: 'true',
    origin: '*'
  })

  try {
    const response = await fetchWithTimeout(`${WIKIPEDIA_API}?${params}`)
    
    if (!response.ok) {
      console.error(`Wikipedia API error for ${pageTitle}: ${response.status} ${response.statusText}`)
      return ''
    }
    
    const data = await response.json()
    
    const pages = data.query?.pages
    if (!pages) {
      console.warn(`No pages found for ${pageTitle}`)
      return ''
    }
    
    const pageId = Object.keys(pages)[0]
    const extract = pages[pageId]?.extract || ''
    
    if (!extract) {
      console.warn(`No extract found for ${pageTitle}`)
    }
    
    return extract
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`Timeout fetching Wikipedia content for ${pageTitle}`)
    } else {
      console.error(`Failed to fetch Wikipedia content for ${pageTitle}:`, error)
    }
    return ''
  }
}

async function fetchWikipediaInfobox(pageTitle: string): Promise<Record<string, string>> {
  const params = new URLSearchParams({
    action: 'parse',
    format: 'json',
    page: pageTitle,
    prop: 'text',
    origin: '*'
  })

  try {
    const response = await fetchWithTimeout(`${WIKIPEDIA_API}?${params}`)
    
    if (!response.ok) {
      console.error(`Wikipedia API error for ${pageTitle} infobox: ${response.status} ${response.statusText}`)
      return {}
    }
    
    const data = await response.json()
    
    if (!data.parse?.text?.['*']) {
      console.warn(`No parse data found for ${pageTitle}`)
      return {}
    }
    
    const html = data.parse.text['*']
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    
    const infobox: Record<string, string> = {}
    const infoboxTables = doc.querySelectorAll('table.infobox')
    
    if (infoboxTables.length === 0) {
      console.warn(`No infobox found for ${pageTitle}`)
    }
    
    infoboxTables.forEach(table => {
      const rows = table.querySelectorAll('tr')
      
      rows.forEach(row => {
        const header = row.querySelector('th')
        const dataCell = row.querySelector('td')
        
        if (header && dataCell) {
          const key = header.textContent?.trim().toLowerCase().replace(/\s+/g, ' ') || ''
          let value = dataCell.textContent?.trim() || ''
          value = value.replace(/\[\d+\]/g, '').replace(/\s+/g, ' ').trim()
          
          if (key && value) {
            infobox[key] = value
          }
        }
      })
    })
    
    return infobox
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`Timeout fetching Wikipedia infobox for ${pageTitle}`)
    } else {
      console.error(`Failed to fetch Wikipedia infobox for ${pageTitle}:`, error)
    }
    return {}
  }
}

function extractCircuitLength(infobox: Record<string, string>): string | undefined {
  const lengthKeys = ['length', 'circuit length', 'lap length', 'distance', 'race length']
  for (const key of lengthKeys) {
    if (infobox[key]) {
      const text = infobox[key]
      const kmMatch = text.match(/(\d+\.?\d*)\s*km/i)
      if (kmMatch) {
        return `${parseFloat(kmMatch[1]).toFixed(3)} km`
      }
      const miMatch = text.match(/(\d+\.?\d*)\s*mi/i)
      if (miMatch) {
        return `${(parseFloat(miMatch[1]) * 1.60934).toFixed(3)} km`
      }
      const mMatch = text.match(/(\d+\.?\d*)\s*m(?:eters?|etres?)?\b/i)
      if (mMatch) {
        return `${(parseFloat(mMatch[1]) / 1000).toFixed(3)} km`
      }
    }
  }
  return undefined
}

function extractCorners(infobox: Record<string, string>): number | undefined {
  const cornerKeys = ['turns', 'corners', 'number of turns']
  for (const key of cornerKeys) {
    if (infobox[key]) {
      const match = infobox[key].match(/(\d+)/)
      if (match) {
        return parseInt(match[1], 10)
      }
    }
  }
  return undefined
}

function extractFirstGP(infobox: Record<string, string>, content: string): string | undefined {
  const gpKeys = ['first grand prix', 'first f1 grand prix', 'first race', 'opened', 'inauguration']
  for (const key of gpKeys) {
    if (infobox[key]) {
      const match = infobox[key].match(/(\d{4})/)
      if (match) {
        return match[1]
      }
    }
  }
  
  const contentMatch = content.match(/first.*?(?:Grand Prix|Formula One|F1).*?(?:was held in|held in|in)\s+(\d{4})/i)
  if (contentMatch) {
    return contentMatch[1]
  }
  
  return undefined
}

function extractLapRecord(infobox: Record<string, string>): string | undefined {
  const recordKeys = ['lap record', 'race lap record', 'fastest lap', 'fastest race lap']
  for (const key of recordKeys) {
    if (infobox[key]) {
      const timeMatch = infobox[key].match(/(\d+):(\d+)\.(\d+)/)
      if (timeMatch) {
        const driverMatch = infobox[key].match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/)
        const yearMatch = infobox[key].match(/\(?\s*(\d{4})\s*\)?/)
        
        const time = `${timeMatch[1]}:${timeMatch[2]}.${timeMatch[3]}`
        if (driverMatch) {
          return yearMatch ? `${time} (${driverMatch[1]}, ${yearMatch[1]})` : `${time} (${driverMatch[1]})`
        }
        return time
      }
    }
  }
  return undefined
}

function extractFacts(content: string, circuitName: string): string[] {
  const facts: string[] = []
  
  const sections = content.split(/\n==\s*/)
  
  let historyText = ''
  let characteristicsText = ''
  
  for (const section of sections) {
    const lowerSection = section.toLowerCase()
    if (lowerSection.includes('history') || lowerSection.includes('background')) {
      historyText += section
    }
    if (lowerSection.includes('layout') || lowerSection.includes('characteristic') || lowerSection.includes('track')) {
      characteristicsText += section
    }
  }
  
  const combinedText = historyText + ' ' + characteristicsText + ' ' + content
  const sentences = combinedText.split(/\.\s+/)
  
  const keywords = [
    'designed', 'built', 'opened', 'first',
    'fast', 'fastest', 'speed',
    'elevation', 'altitude', 'climb',
    'challenging', 'difficult', 'technical',
    'street', 'purpose-built', 'temporary',
    'iconic', 'famous', 'known for', 'notable',
    'features', 'includes', 'consists',
    'longest', 'shortest', 'unique',
    'chicane', 'hairpin', 'corner', 'straight',
    'banked', 'gradient', 'uphill', 'downhill',
    'historic', 'tradition', 'classic',
    'record', 'lap time'
  ]
  
  const seenFacts = new Set<string>()
  
  for (const sentence of sentences) {
    const trimmed = sentence.trim()
    
    if (trimmed.length < 40 || trimmed.length > 250) continue
    if (trimmed.includes('Retrieved') || trimmed.includes('Citation')) continue
    if (trimmed.includes('==') || trimmed.includes('ISBN')) continue
    if (/\d{4}-\d{2}-\d{2}/.test(trimmed)) continue
    
    const normalized = trimmed.toLowerCase()
    const hasKeyword = keywords.some(kw => normalized.includes(kw))
    
    if (hasKeyword && !seenFacts.has(normalized)) {
      const cleanFact = trimmed.replace(/\[\d+\]/g, '').trim()
      if (cleanFact.length >= 40) {
        facts.push(cleanFact + (cleanFact.endsWith('.') ? '' : '.'))
        seenFacts.add(normalized)
      }
    }
    
    if (facts.length >= 10) break
  }
  
  return facts.slice(0, 8)
}

function extractRaceStatistics(content: string, infobox: Record<string, string>): {
  totalRaces?: number
  yearRange?: string
  mostWinsDriver?: string
  mostWinsCount?: number
} {
  const stats: any = {}
  
  for (const [key, value] of Object.entries(infobox)) {
    if (key.includes('races') || key.includes('grands prix') || key === 'number of races') {
      const match = value.match(/(\d+)/)
      if (match) {
        stats.totalRaces = parseInt(match[1], 10)
      }
    }
    
    if (key.includes('first grand prix') || key === 'first race') {
      const yearMatch = value.match(/(\d{4})/)
      if (yearMatch) {
        const currentYear = new Date().getFullYear()
        stats.yearRange = `${yearMatch[1]}-${currentYear}`
      }
    }
  }
  
  const raceCountPatterns = [
    /hosted\s+(\d+)\s+(?:Formula One|F1|Formula 1)\s+(?:Grands? Prix|races?)/i,
    /(\d+)\s+(?:Formula One|F1|Formula 1)\s+(?:Grands? Prix|races?)\s+(?:have been )?held/i,
    /held.*?(\d+)\s+times/i
  ]
  
  for (const pattern of raceCountPatterns) {
    const match = content.match(pattern)
    if (match && !stats.totalRaces) {
      const count = parseInt(match[1], 10)
      if (count > 0 && count < 200) {
        stats.totalRaces = count
        break
      }
    }
  }
  
  const yearRangePatterns = [
    /(?:from|between)\s+(\d{4})\s+(?:to|and|–|-)\s+(\d{4}|present)/i,
    /since\s+(\d{4})/i,
    /(\d{4})\s+(?:–|-)\s+(?:present|ongoing|\d{4})/i
  ]
  
  for (const pattern of yearRangePatterns) {
    const match = content.match(pattern)
    if (match && !stats.yearRange) {
      const startYear = match[1]
      const endYear = match[2] && match[2] !== 'present' 
        ? match[2] 
        : new Date().getFullYear().toString()
      stats.yearRange = `${startYear}-${endYear}`
      break
    }
  }
  
  const driverWinsPatterns = [
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+).*?won\s+(?:the\s+)?(?:race\s+)?(\d+)\s+times?/i,
    /most\s+(?:wins|successful).*?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+).*?\((\d+)/i,
    /record.*?(\d+)\s+(?:wins|victories).*?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i
  ]
  
  for (const pattern of driverWinsPatterns) {
    const match = content.match(pattern)
    if (match) {
      if (pattern.source.includes('record')) {
        stats.mostWinsCount = parseInt(match[1], 10)
        stats.mostWinsDriver = match[2]
      } else if (pattern.source.includes('most')) {
        stats.mostWinsDriver = match[1]
        stats.mostWinsCount = parseInt(match[2], 10)
      } else {
        stats.mostWinsDriver = match[1]
        stats.mostWinsCount = parseInt(match[2], 10)
      }
      if (stats.mostWinsCount > 0 && stats.mostWinsCount < 50) {
        break
      }
    }
  }
  
  return stats
}

export async function scrapeWikipediaData(circuitId: string): Promise<WikipediaData> {
  const wikipediaTitle = WIKIPEDIA_MAPPING[circuitId] || 
                         WIKIPEDIA_MAPPING[circuitId.replace('-', '_')] ||
                         WIKIPEDIA_MAPPING[circuitId.replace('_', '-')]
  
  if (!wikipediaTitle) {
    console.warn(`No Wikipedia mapping found for circuit: ${circuitId}`)
    return { 
      facts: [],
      corners: undefined
    }
  }

  console.log(`Scraping Wikipedia data for ${circuitId} from ${wikipediaTitle}`)

  try {
    const [content, infobox] = await Promise.all([
      fetchWikipediaContent(wikipediaTitle),
      fetchWikipediaInfobox(wikipediaTitle)
    ])

    console.log(`Fetched ${Object.keys(infobox).length} infobox fields for ${circuitId}`)
    if (Object.keys(infobox).length > 0) {
      console.log(`Sample infobox keys for ${circuitId}:`, Object.keys(infobox).slice(0, 10))
    }

    if (!content && Object.keys(infobox).length === 0) {
      console.warn(`No Wikipedia data retrieved for ${circuitId} from ${wikipediaTitle}`)
      return { 
        facts: [],
        corners: undefined
      }
    }

    const circuitName = wikipediaTitle.replace(/_/g, ' ')
    const facts = extractFacts(content, circuitName)
    const length = extractCircuitLength(infobox)
    const corners = extractCorners(infobox)
    const firstGP = extractFirstGP(infobox, content)
    const lapRecord = extractLapRecord(infobox)
    const raceStats = extractRaceStatistics(content, infobox)

    const result = {
      facts,
      length,
      corners,
      firstGP,
      lapRecord,
      totalRaces: raceStats.totalRaces,
      yearRange: raceStats.yearRange,
      mostWins: raceStats.mostWinsDriver && raceStats.mostWinsCount ? {
        driver: raceStats.mostWinsDriver,
        wins: raceStats.mostWinsCount
      } : undefined
    }

    console.log(`Extracted data for ${circuitId}:`, {
      factsCount: result.facts.length,
      hasLength: !!result.length,
      hasCorners: !!result.corners,
      hasFirstGP: !!result.firstGP,
      hasLapRecord: !!result.lapRecord,
      hasTotalRaces: !!result.totalRaces,
      hasYearRange: !!result.yearRange,
      hasMostWins: !!result.mostWins
    })

    return result
  } catch (error) {
    console.error(`Error scraping Wikipedia for ${circuitId}:`, error)
    return { 
      facts: [],
      corners: undefined
    }
  }
}

export async function scrapeAllCircuitsData(circuitIds: string[]): Promise<Map<string, WikipediaData>> {
  const dataMap = new Map<string, WikipediaData>()
  
  const results = await Promise.allSettled(
    circuitIds.map(async id => {
      const data = await scrapeWikipediaData(id)
      return { id, data }
    })
  )

  results.forEach(result => {
    if (result.status === 'fulfilled') {
      dataMap.set(result.value.id, result.value.data)
    }
  })

  return dataMap
}
