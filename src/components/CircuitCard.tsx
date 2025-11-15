import { Circuit } from '@/lib/circuits'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Flag, MapPin } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface CircuitCardProps {
  circuit: Circuit
  matchPercentage: number
}

export function CircuitCard({ circuit, matchPercentage }: CircuitCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl font-semibold leading-tight mb-2">
                {circuit.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-1.5 text-base">
                <MapPin size={16} weight="fill" className="text-muted-foreground" />
                {circuit.location}
              </CardDescription>
            </div>
            <Badge 
              variant={matchPercentage >= 75 ? 'default' : 'secondary'}
              className="text-lg px-3 py-1.5 font-semibold bg-accent text-accent-foreground"
            >
              {matchPercentage.toFixed(0)}%
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {circuit.firstGP && (
              <Badge variant="outline" className="gap-1.5">
                <Flag size={14} weight="fill" />
                First GP: {circuit.firstGP}
              </Badge>
            )}
            {circuit.length && circuit.length !== 'N/A' && (
              <Badge variant="outline">
                Length: {circuit.length}
              </Badge>
            )}
            {circuit.corners > 0 && (
              <Badge variant="outline">
                Corners: {circuit.corners}
              </Badge>
            )}
            {circuit.lapRecord && (
              <Badge variant="outline" className="hidden sm:inline-flex">
                Record: {circuit.lapRecord}
              </Badge>
            )}
          </div>

          {circuit.facts && circuit.facts.length > 0 && (
            <>
              <Separator />

              <div>
                <h4 className="font-medium text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                  Circuit Facts
                </h4>
                <ScrollArea className="h-[200px] pr-4">
                  <ul className="space-y-3">
                    {circuit.facts.map((fact, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index, duration: 0.2 }}
                        className="text-sm leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-[0.6em] before:w-1.5 before:h-1.5 before:bg-primary before:rounded-full"
                      >
                        {fact}
                      </motion.li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
