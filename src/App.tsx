import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { DrawingCanvas } from '@/components/DrawingCanvas'
import { CircuitCard } from '@/components/CircuitCard'
import { SettingsSheet } from '@/components/SettingsSheet'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Toaster } from 'sonner'
import { X, Flag, Pencil } from '@phosphor-icons/react'
import { Circuit } from '@/lib/circuits'
import { loadAllCircuits } from '@/lib/circuit-loader'
import { matchShape, MatchAlgorithm, Point } from '@/lib/matching'

interface MatchedCircuit {
  circuitId: string
  similarity: number
}

function App() {
  const [algorithm, setAlgorithm] = useKV<MatchAlgorithm>('match-algorithm', 'hausdorff')
  const [matchedCircuit, setMatchedCircuit] = useState<MatchedCircuit | null>(null)
  const [key, setKey] = useState(0)
  const [selectedCircuitId, setSelectedCircuitId] = useState<string>('')
  const [hasDrawn, setHasDrawn] = useState(false)
  const [circuits, setCircuits] = useState<Circuit[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const currentAlgorithm = algorithm || 'hausdorff'

  useEffect(() => {
    loadAllCircuits()
      .then(loadedCircuits => {
        console.log(`Loaded ${loadedCircuits.length} circuits successfully`)
        setCircuits(loadedCircuits)
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Failed to load circuits:', error)
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
        setCircuits([])
        setIsLoading(false)
      })
  }, [])

  const handleDrawingStart = () => {
    if (selectedCircuitId) {
      setSelectedCircuitId('')
    }
  }

  const handleDrawingComplete = (points: Point[]) => {
    if (points.length < 10) {
      return
    }

    if (circuits.length === 0) {
      return
    }

    setHasDrawn(true)
    setSelectedCircuitId('')

    const matches = circuits.map(circuit => ({
      circuitId: circuit.id,
      similarity: matchShape(points, circuit.layout, currentAlgorithm)
    }))

    matches.sort((a, b) => b.similarity - a.similarity)

    const bestMatch = matches[0]
    
    if (bestMatch.similarity < 20) {
      setMatchedCircuit(null)
    } else {
      setMatchedCircuit(bestMatch)
    }
  }

  const handleClear = () => {
    setMatchedCircuit(null)
    setSelectedCircuitId('')
    setHasDrawn(false)
    setKey(prev => prev + 1)
  }

  const handleAlgorithmChange = (newAlgorithm: MatchAlgorithm) => {
    setAlgorithm(newAlgorithm)
  }

  const handleCircuitSelect = (circuitId: string) => {
    setSelectedCircuitId(circuitId)
    setMatchedCircuit(null)
    setHasDrawn(false)
    setKey(prev => prev + 1)
  }

  const currentCircuit = matchedCircuit
    ? circuits.find(c => c.id === matchedCircuit.circuitId)
    : selectedCircuitId
    ? circuits.find(c => c.id === selectedCircuitId)
    : null

  const displayPercentage = matchedCircuit ? matchedCircuit.similarity : 100

  const showOverlay = matchedCircuit || (selectedCircuitId && !hasDrawn)
  
  const overlayCircuitPoints = showOverlay && currentCircuit && !hasDrawn
    ? [...currentCircuit.layout, currentCircuit.layout[0]]
    : matchedCircuit && currentCircuit
    ? [...currentCircuit.layout, currentCircuit.layout[0]]
    : undefined

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />
      
      <div className="container max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <header className="mb-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Flag size={32} weight="fill" className="text-primary" />
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Circuit Sketch
                </h1>
                <p className="text-muted-foreground text-sm md:text-base mt-1">
                  Draw a shape and match it to F1 circuits
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <SettingsSheet algorithm={currentAlgorithm} onAlgorithmChange={handleAlgorithmChange} />
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <Flag size={64} weight="duotone" className="mx-auto text-primary animate-pulse" />
              <p className="text-lg text-muted-foreground">Loading F1 circuits from GitHub...</p>
            </div>
          </div>
        ) : circuits.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4 max-w-md">
              <Flag size={64} weight="duotone" className="mx-auto text-muted-foreground" />
              <p className="text-lg text-muted-foreground font-medium">Failed to load circuits</p>
              <p className="text-sm text-muted-foreground">
                Unable to load F1 circuit data from GitHub. This could be due to:
              </p>
              <ul className="text-xs text-muted-foreground text-left list-disc pl-6 space-y-1">
                <li>Network connectivity issues</li>
                <li>GitHub repository structure changes</li>
                <li>CORS restrictions</li>
              </ul>
              <div className="pt-2">
                <Button onClick={() => window.location.reload()} variant="outline" className="gap-2">
                  <X size={16} />
                  Retry
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">Draw or Browse</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="gap-2"
                >
                  <X size={16} />
                  Clear
                </Button>
              </div>

              <Select value={selectedCircuitId} onValueChange={handleCircuitSelect}>
                <SelectTrigger className="w-full h-12 text-base">
                  <SelectValue placeholder="Select a circuit to view or draw below" />
                </SelectTrigger>
                <SelectContent>
                  {circuits.map(circuit => (
                    <SelectItem key={circuit.id} value={circuit.id} className="text-base">
                      <div className="flex flex-col">
                        <span className="font-medium">{circuit.name}</span>
                        <span className="text-xs text-muted-foreground">{circuit.location}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <DrawingCanvas 
                key={key} 
                onDrawingComplete={handleDrawingComplete}
                onDrawingStart={handleDrawingStart}
                overlayCircuit={overlayCircuitPoints}
              />
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Pencil size={16} weight="duotone" />
                  {selectedCircuitId 
                    ? 'Circuit displayed above - draw to compare' 
                    : 'Draw a closed shape or select a circuit above'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-medium">
                {matchedCircuit 
                  ? 'Best Match' 
                  : selectedCircuitId
                  ? 'Circuit Details'
                  : 'Your Match'}
              </h2>
              {currentCircuit ? (
                <CircuitCard 
                  circuit={currentCircuit} 
                  matchPercentage={displayPercentage}
                />
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                  <Flag size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground text-lg font-medium mb-2">
                    No circuit selected
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Draw a circuit shape or select a circuit to see details
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App