import { writeFileSync } from 'fs'
import { join } from 'path'

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

const WIKIPEDIA_MAPPING: Record<string, string> = {
  'monza': 'Autodromo_Nazionale_di_Monza',
  'monaco': 'Circuit_de_Monaco',
  'silverstone': 'Silverstone_Circuit',
  'spa': 'Circuit_de_Spa-Francorchamps',
  'suzuka': 'Suzuka_International_Racing_Course',
  'interlagos': 'Autódromo_José_Carlos_Pace',
  'albert-park': 'Melbourne_Grand_Prix_Circuit',
  'albert_park': 'Melbourne_Grand_Prix_Circuit',
  'americas': 'Circuit_of_the_Americas',
  'bahrain': 'Bahrain_International_Circuit',
  'baku': 'Baku_City_Circuit',
  'catalunya': 'Circuit_de_Barcelona-Catalunya',
  'hockenheim': 'Hockenheimring',
  'hockenheimring': 'Hockenheimring',
  'hungaroring': 'Hungaroring',
  'imola': 'Autodromo_Internazionale_Enzo_e_Dino_Ferrari',
  'jeddah': 'Jeddah_Corniche_Circuit',
  'marina-bay': 'Marina_Bay_Street_Circuit',
  'marina_bay': 'Marina_Bay_Street_Circuit',
  'miami': 'Miami_International_Autodrome',
  'red-bull-ring': 'Red_Bull_Ring',
  'red_bull_ring': 'Red_Bull_Ring',
  'rodriguez': 'Autódromo_Hermanos_Rodríguez',
  'shanghai': 'Shanghai_International_Circuit',
  'vegas': 'Las_Vegas_Grand_Prix',
  'villeneuve': 'Circuit_Gilles_Villeneuve',
  'yas-marina': 'Yas_Marina_Circuit',
  'yas_marina': 'Yas_Marina_Circuit',
  'zandvoort': 'Circuit_Zandvoort',
  'sakhir': 'Bahrain_International_Circuit',
  'saudi-arabia': 'Jeddah_Corniche_Circuit',
  'ricard': 'Circuit_Paul_Ricard',
  'sochi': 'Sochi_Autodrom'
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
    
    const infobox: Record<string, string> = {}
    const infoboxMatch = html.match(/<table[^>]*class="[^"]*infobox[^"]*"[^>]*>([\s\S]*?)<\/table>/i)
    
    if (!infoboxMatch) {
      console.warn(`No infobox found for ${pageTitle}`)
      return {}
    }
    
    const tableHtml = infoboxMatch[0]
    const rowMatches = tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)
    
    for (const rowMatch of rowMatches) {
      const rowHtml = rowMatch[1]
      const headerMatch = rowHtml.match(/<th[^>]*>([\s\S]*?)<\/th>/)
      const dataMatch = rowHtml.match(/<td[^>]*>([\s\S]*?)<\/td>/)
      
      if (headerMatch && dataMatch) {
        const key = headerMatch[1]
          .replace(/<[^>]+>/g, '')
          .trim()
          .toLowerCase()
          .replace(/\s+/g, ' ')
        
        let value = dataMatch[1]
          .replace(/<[^>]+>/g, '')
          .replace(/\[\d+\]/g, '')
          .replace(/\s+/g, ' ')
          .trim()
        
        if (key && value) {
          infobox[key] = value
        }
      }
    }
    
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
    // Pattern: "Driver Name has won 6 times" or "Driver Name won the race 6 times"
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+).*?won\s+(?:the\s+)?(?:race\s+)?(\d+)\s+times?/i,
    // Pattern: "most wins: Driver Name (6)" or "most successful: Driver Name with 6"
    /most\s+(?:wins|successful).*?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+).*?(?:\(|with\s+)(\d+)/i,
    // Pattern: "record 6 wins by Driver Name" or "record of 6 victories"
    /record.*?(?:of\s+)?(\d+)\s+(?:wins|victories).*?(?:by\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
    // Pattern: "Driver Name holds the record with 6 wins"
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s+holds?\s+(?:the\s+)?record.*?(?:with\s+)?(\d+)\s+(?:wins|victories)/i,
    // Pattern: "Driver Name, 6 wins" (common in lists)
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+),?\s+(\d+)\s+wins?/i,
    // Pattern in infobox: "Most wins (driver): Driver Name (6)"
    /most\s+wins.*?:.*?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+).*?\((\d+)/i
  ]
  
  for (const pattern of driverWinsPatterns) {
    const match = content.match(pattern)
    if (match) {
      // Determine which group has the number and which has the name based on pattern
      let driver: string
      let wins: number
      
      if (pattern.source.includes('record.*?(?:of')) {
        // For "record of 6 wins by Driver Name" pattern
        wins = parseInt(match[1], 10)
        driver = match[2]
      } else {
        // For most patterns: "Driver Name ... 6" format
        driver = match[1]
        wins = parseInt(match[2], 10)
      }
      
      // Validate the win count is reasonable (1-20 for a single circuit)
      if (wins > 0 && wins <= 20) {
        stats.mostWinsDriver = driver
        stats.mostWinsCount = wins
        break
      }
    }
  }
  
  // Also check infobox for most wins data
  for (const [key, value] of Object.entries(infobox)) {
    if (key.includes('most wins') || key.includes('most successful')) {
      // Try to extract "Driver Name (6 wins)" or similar
      const match = value.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+).*?\((\d+)/i)
      if (match && !stats.mostWinsDriver) {
        const wins = parseInt(match[2], 10)
        if (wins > 0 && wins <= 20) {
          stats.mostWinsDriver = match[1]
          stats.mostWinsCount = wins
        }
      }
    }
  }
  
  return stats
}

async function scrapeWikipediaData(circuitId: string): Promise<WikipediaData> {
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

async function main() {
  console.log('Starting Wikipedia scraper...')
  
  const circuitIds = Object.keys(WIKIPEDIA_MAPPING)
  const uniqueIds = [...new Set(circuitIds)]
  
  console.log(`Scraping ${uniqueIds.length} circuits...`)
  
  const results: Record<string, WikipediaData> = {}
  
  for (let i = 0; i < uniqueIds.length; i++) {
    const id = uniqueIds[i]
    console.log(`\n[${i + 1}/${uniqueIds.length}] Processing ${id}...`)
    
    const data = await scrapeWikipediaData(id)
    results[id] = data
    
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  const outputPath = join(process.cwd(), 'src', 'data', 'wikipedia-data.json')
  writeFileSync(outputPath, JSON.stringify(results, null, 2))
  
  console.log(`\n✓ Scraped data for ${Object.keys(results).length} circuits`)
  console.log(`✓ Saved to ${outputPath}`)
  
  const stats = {
    total: Object.keys(results).length,
    withFacts: Object.values(results).filter(d => d.facts.length > 0).length,
    withLength: Object.values(results).filter(d => d.length).length,
    withCorners: Object.values(results).filter(d => d.corners).length,
    withRaceStats: Object.values(results).filter(d => d.totalRaces || d.yearRange || d.mostWins).length
  }
  
  console.log('\nStatistics:')
  console.log(`  Circuits with facts: ${stats.withFacts}/${stats.total}`)
  console.log(`  Circuits with length: ${stats.withLength}/${stats.total}`)
  console.log(`  Circuits with corners: ${stats.withCorners}/${stats.total}`)
  console.log(`  Circuits with race stats: ${stats.withRaceStats}/${stats.total}`)
}

main().catch(console.error)
