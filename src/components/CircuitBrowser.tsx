import { useState, useEffect } from 'react'
import { Circuit } from '@/lib/circuits'
import { loadCircuitWithWikipedia } from '@/lib/circuit-loader'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, Timer, CalendarBlank, CornersIn } from '@phosphor-icons/react'

interface CircuitBrowserProps {
  circuits: Circuit[]
  onBack: () => void
  onCircuitSelect?: (circuit: Circuit) => void
}

export function CircuitBrowser({ circuits, onBack, onCircuitSelect }: CircuitBrowserProps) {
  const [selectedCircuitId, setSelectedCircuitId] = useState<string | null>(null)
  const [loadedCircuit, setLoadedCircuit] = useState<Circuit | null>(null)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isLoadingWiki, setIsLoadingWiki] = useState(false)

  useEffect(() => {
    if (selectedCircuitId) {
      setIsLoadingWiki(true)
      setLoadingProgress(0)
      
      loadCircuitWithWikipedia(selectedCircuitId, (progress) => {
        setLoadingProgress(progress * 100)
      }).then(circuit => {
        setLoadedCircuit(circuit)
        setIsLoadingWiki(false)
        if (circuit && onCircuitSelect) {
          onCircuitSelect(circuit)
        }
      })
    }
  }, [selectedCircuitId, onCircuitSelect])

  const handleCircuitClick = (circuitId: string) => {
    setSelectedCircuitId(circuitId)
    setLoadedCircuit(null)
  }

  const displayCircuit = loadedCircuit || circuits.find(c => c.id === selectedCircuitId)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft size={16} />
          Back to Drawing
        </Button>
        <h2 className="text-2xl font-semibold">Browse F1 Circuits</h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Select a Circuit</h3>
          <ScrollArea className="h-[600px] rounded-lg border p-4">
            <div className="space-y-2">
              {circuits.map(circuit => (
                <button
                  key={circuit.id}
                  onClick={() => handleCircuitClick(circuit.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedCircuitId === circuit.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card hover:bg-accent hover:border-accent-foreground/20'
                  }`}
                >
                  <div className="font-medium">{circuit.name}</div>
                  <div className="text-sm opacity-80 flex items-center gap-1 mt-1">
                    <MapPin size={14} weight="fill" />
                    {circuit.location}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="space-y-4">
          {displayCircuit ? (
            <>
              <div className="bg-card rounded-lg border p-6 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold">{displayCircuit.name}</h3>
                  <div className="flex items-center gap-1 text-muted-foreground mt-1">
                    <MapPin size={16} weight="fill" />
                    <span>{displayCircuit.location}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {displayCircuit.length && displayCircuit.length !== 'Loading...' && (
                    <Badge variant="secondary" className="gap-1">
                      <Timer size={14} />
                      {displayCircuit.length}
                    </Badge>
                  )}
                  {displayCircuit.corners > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      <CornersIn size={14} />
                      {displayCircuit.corners} corners
                    </Badge>
                  )}
                  {displayCircuit.firstGP && (
                    <Badge variant="secondary" className="gap-1">
                      <CalendarBlank size={14} />
                      Since {displayCircuit.firstGP}
                    </Badge>
                  )}
                </div>

                {isLoadingWiki && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Loading information from Wikipedia...
                    </div>
                    <Progress value={loadingProgress} className="h-2" />
                  </div>
                )}

                {!isLoadingWiki && displayCircuit.facts && displayCircuit.facts.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">About this circuit</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {displayCircuit.facts.map((fact, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-primary">•</span>
                          <span>{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="bg-card rounded-lg border p-4 aspect-square">
                <CircuitCanvas layout={displayCircuit.layout} name={displayCircuit.name} />
              </div>
            </>
          ) : (
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center h-full flex items-center justify-center">
              <div>
                <MapPin size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-lg font-medium">
                  Select a circuit to view details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CircuitCanvas({ layout, name }: { layout: { x: number; y: number }[], name: string }) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!canvas || !layout || layout.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    ctx.clearRect(0, 0, width, height)

    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim()
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.beginPath()
    layout.forEach((point, i) => {
      const x = point.x * width
      const y = point.y * height
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.closePath()
    ctx.stroke()

    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim()
    const startX = layout[0].x * width
    const startY = layout[0].y * height
    ctx.beginPath()
    ctx.arc(startX, startY, 6, 0, Math.PI * 2)
    ctx.fill()
  }, [layout, canvas])

  return (
    <canvas
      ref={setCanvas}
      width={400}
      height={400}
      className="w-full h-full"
      aria-label={`Track layout for ${name}`}
    />
  )
}
