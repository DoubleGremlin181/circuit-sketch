const CIRCUITS_REPO_BASE = 'https://raw.githubusercontent.com/bacinger/f1-circuits/master/circuits'

const CIRCUIT_MAPPING = [
  { id: 'albert_park', name: 'Albert Park Circuit', country: 'Australia', location: 'Melbourne, Australia' },
  { id: 'americas', name: 'Circuit of the Americas', country: 'USA', location: 'Austin, Texas' },
  { id: 'bahrain', name: 'Bahrain International Circuit', country: 'Bahrain', location: 'Sakhir, Bahrain' },
  { id: 'baku', name: 'Baku City Circuit', country: 'Azerbaijan', location: 'Baku, Azerbaijan' },
  { id: 'catalunya', name: 'Circuit de Barcelona-Catalunya', country: 'Spain', location: 'Barcelona, Spain' },
  { id: 'hockenheimring', name: 'Hockenheimring', country: 'Germany', location: 'Hockenheim, Germany' },
  { id: 'hungaroring', name: 'Hungaroring', country: 'Hungary', location: 'Budapest, Hungary' },
  { id: 'imola', name: 'Autodromo Enzo e Dino Ferrari', country: 'Italy', location: 'Imola, Italy' },
  { id: 'interlagos', name: 'Autódromo José Carlos Pace', country: 'Brazil', location: 'São Paulo, Brazil' },
  { id: 'jeddah', name: 'Jeddah Corniche Circuit', country: 'Saudi Arabia', location: 'Jeddah, Saudi Arabia' },
  { id: 'marina_bay', name: 'Marina Bay Street Circuit', country: 'Singapore', location: 'Singapore' },
  { id: 'miami', name: 'Miami International Autodrome', country: 'USA', location: 'Miami, Florida' },
  { id: 'monaco', name: 'Circuit de Monaco', country: 'Monaco', location: 'Monte Carlo, Monaco' },
  { id: 'monza', name: 'Autodromo Nazionale di Monza', country: 'Italy', location: 'Monza, Italy' },
  { id: 'red_bull_ring', name: 'Red Bull Ring', country: 'Austria', location: 'Spielberg, Austria' },
  { id: 'rodriguez', name: 'Autódromo Hermanos Rodríguez', country: 'Mexico', location: 'Mexico City, Mexico' },
  { id: 'shanghai', name: 'Shanghai International Circuit', country: 'China', location: 'Shanghai, China' },
  { id: 'silverstone', name: 'Silverstone Circuit', country: 'United Kingdom', location: 'Silverstone, England' },
  { id: 'spa', name: 'Circuit de Spa-Francorchamps', country: 'Belgium', location: 'Spa, Belgium' },
  { id: 'suzuka', name: 'Suzuka International Racing Course', country: 'Japan', location: 'Suzuka, Japan' },
  { id: 'vegas', name: 'Las Vegas Street Circuit', country: 'USA', location: 'Las Vegas, Nevada' },
  { id: 'villeneuve', name: 'Circuit Gilles Villeneuve', country: 'Canada', location: 'Montreal, Canada' },
  { id: 'yas_marina', name: 'Yas Marina Circuit', country: 'UAE', location: 'Abu Dhabi, UAE' },
  { id: 'zandvoort', name: 'Circuit Zandvoort', country: 'Netherlands', location: 'Zandvoort, Netherlands' },
]

interface CircuitLayout {
  x: number
  y: number
}

async function fetchCircuitLayout(circuitId: string): Promise<CircuitLayout[]> {
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

async function main() {
  const fs = await import('fs/promises')
  const path = await import('path')
  
  const circuits = []
  
  console.log('Fetching circuit layouts from GitHub...\n')
  
  for (const mapping of CIRCUIT_MAPPING) {
    process.stdout.write(`Fetching ${mapping.name}... `)
    const layout = await fetchCircuitLayout(mapping.id)
    
    if (layout.length > 0) {
      circuits.push({
        id: mapping.id,
        name: mapping.name,
        location: mapping.location,
        country: mapping.country,
        layout
      })
      console.log('✓')
    } else {
      console.log('✗ (no data)')
    }
    
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  const outputDir = path.join(process.cwd(), 'src', 'data')
  await fs.mkdir(outputDir, { recursive: true })
  
  const outputPath = path.join(outputDir, 'circuits.json')
  await fs.writeFile(outputPath, JSON.stringify(circuits, null, 2))
  
  console.log(`\n✓ Saved ${circuits.length} circuits to ${outputPath}`)
}

main().catch(console.error)
