import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { DrawingCanvas } from '@/components/DrawingCanvas'
import { CircuitCard } from '@/components/CircuitCard'
import { CircuitBrowser } from '@/components/CircuitBrowser'
import { SettingsSheet } from '@/components/SettingsSheet'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Toaster, toast } from 'sonner'
import { X, Flag, ListBullets } from '@phosphor-icons/react'
import { Circuit } from '@/lib/circuits'
import { loadAllCircuits } from '@/lib/circuit-loader'
import { matchShape, MatchAlgorithm, Point } from '@/lib/matching'

interface MatchedCircuit {
  circuitId: string
  similarity: number
}

type ViewMode = 'draw' | 'browse'

function App() {
  const [algorithm, setAlgorithm] = useKV<MatchAlgorithm>('match-algorithm', 'hausdorff')
  const [matchedCircuit, setMatchedCircuit] = useState<MatchedCircuit | null>(null)
  const [key, setKey] = useState(0)
  const [circuits, setCircuits] = useState<Circuit[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('draw')

  const currentAlgorithm = algorithm || 'hausdorff'

  useEffect(() => {
    const loadedCircuits = loadAllCircuits()
    setCircuits(loadedCircuits)
  }, [])

  const handleDrawingComplete = (points: Point[]) => {
    if (points.length < 10) {
      toast.error('Draw a larger shape to match against circuits')
      return
    }

    if (circuits.length === 0) {
      toast.error('Circuit data still loading, please wait...')
      return
    }

    const matches = circuits.map(circuit => ({
      circuitId: circuit.id,
      similarity: matchShape(points, circuit.layout, currentAlgorithm)
    }))

    matches.sort((a, b) => b.similarity - a.similarity)

    const bestMatch = matches[0]
    
    if (bestMatch.similarity < 20) {
      toast.error('No close match found. Try drawing a different shape!')
      setMatchedCircuit(null)
    } else {
      setMatchedCircuit(bestMatch)
      
      if (bestMatch.similarity >= 75) {
        toast.success('Excellent match! 🏁')
      } else if (bestMatch.similarity >= 50) {
        toast.success('Good match!')
      } else {
        toast('Match found')
      }
    }
  }

  const handleClear = () => {
    setMatchedCircuit(null)
    setKey(prev => prev + 1)
  }

  const handleAlgorithmChange = (newAlgorithm: MatchAlgorithm) => {
    setAlgorithm(newAlgorithm)
    toast.success(`Switched to ${newAlgorithm.replace('-', ' ')} algorithm`)
  }

  const currentCircuit = matchedCircuit 
    ? circuits.find(c => c.id === matchedCircuit.circuitId)
    : null

  if (viewMode === 'browse') {
    return (
      <div className="min-h-screen bg-background">
        <Toaster position="top-center" />
        <div className="container max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          <CircuitBrowser 
            circuits={circuits} 
            onBack={() => setViewMode('draw')}
          />
        </div>
      </div>
    )
  }

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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('browse')}
                className="gap-2"
              >
                <ListBullets size={16} />
                Browse
              </Button>
              <ThemeToggle />
              <SettingsSheet algorithm={currentAlgorithm} onAlgorithmChange={handleAlgorithmChange} />
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Draw Your Circuit</h2>
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
            <DrawingCanvas 
              key={key} 
              onDrawingComplete={handleDrawingComplete}
              overlayCircuit={currentCircuit?.layout}
            />
            <p className="text-sm text-muted-foreground text-center">
              Draw a closed shape with your finger or mouse
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-medium">
              {matchedCircuit ? 'Best Match' : 'Your Match'}
            </h2>
            {currentCircuit && matchedCircuit ? (
              <CircuitCard 
                circuit={currentCircuit} 
                matchPercentage={matchedCircuit.similarity}
              />
            ) : (
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                <Flag size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-lg font-medium mb-2">
                  No match yet
                </p>
                <p className="text-sm text-muted-foreground">
                  Draw a circuit shape to see matching results
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App