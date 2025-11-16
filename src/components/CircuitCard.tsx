import { Circuit } from '@/lib/circuits'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Flag, MapPin, Trophy, Calendar, Article } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface CircuitCardProps {
  circuit: Circuit
  matchPercentage: number
}

export function CircuitCard({ circuit, matchPercentage }: CircuitCardProps) {
  const showMatchBadge = matchPercentage < 100
  
  const hasFacts = circuit.facts && circuit.facts.length > 0
  const hasStats = circuit.totalRaces || circuit.yearRange || circuit.mostWins
  const hasBasicInfo = circuit.firstGP || circuit.length || (circuit.corners && circuit.corners > 0) || circuit.lapRecord

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
                {circuit.name || 'Unknown Circuit'}
              </CardTitle>
              <CardDescription className="flex items-center gap-1.5 text-base">
                <MapPin size={16} weight="fill" className="text-muted-foreground" />
                {circuit.location || 'Unknown Location'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {circuit.wikipediaUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-1.5"
                >
                  <a href={circuit.wikipediaUrl} target="_blank" rel="noopener noreferrer">
                    <Article size={16} weight="duotone" />
                    Wikipedia
                  </a>
                </Button>
              )}
              {showMatchBadge && (
                <Badge 
                  variant={matchPercentage >= 75 ? 'default' : 'secondary'}
                  className="text-lg px-3 py-1.5 font-semibold bg-accent text-accent-foreground"
                >
                  {matchPercentage.toFixed(0)}%
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {hasBasicInfo && (
            <div className="flex flex-wrap gap-2">
              {circuit.firstGP && (
                <Badge variant="outline" className="gap-1.5">
                  <Flag size={14} weight="fill" />
                  First GP: {circuit.firstGP}
                </Badge>
              )}
              {circuit.length && circuit.length !== 'Unknown' && (
                <Badge variant="outline">
                  Length: {circuit.length}
                </Badge>
              )}
              {circuit.corners && circuit.corners > 0 && (
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
          )}

          {hasStats && (
            <>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {circuit.totalRaces && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium uppercase tracking-wide">
                      <Flag size={14} weight="duotone" />
                      Total Races
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {circuit.totalRaces}
                    </div>
                  </div>
                )}
                {circuit.yearRange && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium uppercase tracking-wide">
                      <Calendar size={14} weight="duotone" />
                      Years Active
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {circuit.yearRange}
                    </div>
                  </div>
                )}
                {circuit.mostWins && circuit.mostWins.driver && circuit.mostWins.wins > 0 && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium uppercase tracking-wide">
                      <Trophy size={14} weight="duotone" />
                      Most Wins
                    </div>
                    <div className="text-base font-bold text-primary">
                      {circuit.mostWins.driver}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {circuit.mostWins.wins} {circuit.mostWins.wins === 1 ? 'win' : 'wins'}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {hasFacts && (
            <>
              <Separator />

              <div>
                <h4 className="font-medium text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                  Circuit Facts
                </h4>
                <ScrollArea className="max-h-[400px] pr-4">
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

          {!hasBasicInfo && !hasStats && !hasFacts && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Loading circuit information...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
