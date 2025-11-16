import { useRef, useEffect, useState } from 'react'
import { Point, alignCircuitToDrawing } from '@/lib/matching'

interface DrawingCanvasProps {
  onDrawingComplete: (points: Point[]) => void
  disabled?: boolean
  overlayCircuit?: Point[]
  onDrawingStart?: () => void
}

export function DrawingCanvas({ onDrawingComplete, disabled = false, overlayCircuit, onDrawingStart }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [points, setPoints] = useState<Point[]>([])
  const [theme, setTheme] = useState<string>('light')

  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark')
      setTheme(isDark ? 'dark' : 'light')
    }
    
    checkTheme()
    
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    ctx.clearRect(0, 0, rect.width, rect.height)

    const rootStyles = getComputedStyle(document.documentElement)
    const primaryColor = `oklch(${rootStyles.getPropertyValue('--primary').trim()})`
    const accentColor = `oklch(${rootStyles.getPropertyValue('--accent').trim()})`

    if (overlayCircuit && overlayCircuit.length > 0 && !isDrawing) {
      if (points.length > 0) {
        const alignedCircuit = alignCircuitToDrawing(overlayCircuit, points)
        drawPath(ctx, alignedCircuit, rect.width, rect.height, accentColor, 2.5, [5, 5])
      } else {
        drawPath(ctx, overlayCircuit, rect.width, rect.height, primaryColor, 3, [], true)
      }
    }

    if (points.length > 0) {
      drawPath(ctx, points, rect.width, rect.height, primaryColor, 3)
    }
  }, [points, overlayCircuit, theme, isDrawing])

  const drawPath = (
    ctx: CanvasRenderingContext2D,
    pathPoints: Point[],
    width: number,
    height: number,
    strokeStyle: string = 'oklch(0.55 0.22 25)',
    lineWidth: number = 3,
    lineDash: number[] = [],
    addPadding: boolean = false
  ) => {
    if (pathPoints.length < 2) return

    ctx.save()
    ctx.strokeStyle = strokeStyle
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.globalAlpha = lineDash.length > 0 ? 0.6 : 1
    ctx.setLineDash(lineDash)

    // Add padding to prevent the circuit from touching the edges
    const paddingFactor = addPadding ? 0.9 : 1
    const offsetX = addPadding ? (width * (1 - paddingFactor)) / 2 : 0
    const offsetY = addPadding ? (height * (1 - paddingFactor)) / 2 : 0

    ctx.beginPath()
    ctx.moveTo(pathPoints[0].x * width * paddingFactor + offsetX, pathPoints[0].y * height * paddingFactor + offsetY)

    for (let i = 1; i < pathPoints.length; i++) {
      ctx.lineTo(pathPoints[i].x * width * paddingFactor + offsetX, pathPoints[i].y * height * paddingFactor + offsetY)
    }

    ctx.stroke()
    ctx.restore()
  }

  const getPointFromEvent = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height
    }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return
    
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.setPointerCapture(e.pointerId)
    setIsDrawing(true)
    
    if (onDrawingStart) {
      onDrawingStart()
    }
    
    const point = getPointFromEvent(e)
    setPoints([point])
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return
    
    e.preventDefault()
    const point = getPointFromEvent(e)
    
    setPoints(prev => {
      const lastPoint = prev[prev.length - 1]
      const dx = point.x - lastPoint.x
      const dy = point.y - lastPoint.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance > 0.01) {
        return [...prev, point]
      }
      return prev
    })
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return
    
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.releasePointerCapture(e.pointerId)
    setIsDrawing(false)

    if (points.length > 5) {
      const closedPoints = [...points, points[0]]
      onDrawingComplete(closedPoints)
    }
  }

  const handlePointerCancel = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return
    
    const canvas = canvasRef.current
    if (canvas && e.pointerId) {
      canvas.releasePointerCapture(e.pointerId)
    }
    setIsDrawing(false)
  }

  return (
    <canvas
      ref={canvasRef}
      className={`w-full aspect-[4/3] md:aspect-[16/9] border-2 rounded-lg touch-none cursor-crosshair transition-colors bg-card ${
        isDrawing
          ? 'border-primary shadow-lg'
          : disabled
          ? 'border-muted bg-muted/20'
          : 'border-dashed border-border hover:border-primary/50'
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    />
  )
}

export function clearCanvas(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const canvas = canvasRef.current
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const rect = canvas.getBoundingClientRect()
  ctx.clearRect(0, 0, rect.width, rect.height)
}
