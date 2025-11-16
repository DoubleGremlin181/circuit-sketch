import { useState } from 'react'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { DrawingCanvas } from '@/components/DrawingCanvas'
import { CircuitCard } from '@/components/CircuitCard'
import { SettingsSheet } from '@/components/SettingsSheet'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Toaster } from 'sonner'
import { X, Flag, Pencil } from '@phosphor-icons/react'
import { circuits } from '@/lib/circuits'
import { matchShape, MatchAlgorithm, Point } from '@/lib/matching'

interface MatchedCircuit {
  circuitId: string
  similarity: number
}

function App() {
  const [algorithm, setAlgorithm] = useLocalStorage<MatchAlgorithm>('match-algorithm', 'hausdorff')
  const [matchedCircuit, setMatchedCircuit] = useState<MatchedCircuit | null>(null)
  const [key, setKey] = useState(0)
  const [selectedCircuitId, setSelectedCircuitId] = useState<string>('')
  const [hasDrawn, setHasDrawn] = useState(false)

  const currentAlgorithm = algorithm || 'hausdorff'


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
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <SettingsSheet algorithm={currentAlgorithm} onAlgorithmChange={handleAlgorithmChange} />
            </div>
          </div>
        </header>

        {circuits.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4 max-w-md">
              <Flag size={64} weight="duotone" className="mx-auto text-muted-foreground" />
              <p className="text-lg text-muted-foreground font-medium">No circuits available</p>
              <p className="text-sm text-muted-foreground">
                Circuit data files are missing. Run the data scripts to populate circuit information.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">Canvas</h2>
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
                <SelectTrigger className="w-full h-auto min-h-12 text-base">
                  <SelectValue placeholder="Select a circuit to display" />
                </SelectTrigger>
                <SelectContent>
                  {circuits.map(circuit => (
                    <SelectItem key={circuit.id} value={circuit.id} className="text-base">
                      <div className="flex flex-col items-start">
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
                    ? 'Draw to compare with the circuit shown above' 
                    : 'Draw a closed shape or select a circuit from the dropdown'}
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
                    Draw a shape or select a circuit to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <footer className="container max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <a 
            href="https://github.com/DoubleGremlin181/circuit-sketch" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
          <span>•</span>
          <a 
            href="https://kavi.sh" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Author
          </a>
        </div>
      </footer>
    </div>
  )
}

export default App