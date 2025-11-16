import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Gear } from '@phosphor-icons/react'
import { MatchAlgorithm } from '@/lib/matching'

interface SettingsSheetProps {
  algorithm: MatchAlgorithm
  onAlgorithmChange: (algorithm: MatchAlgorithm) => void
}

export function SettingsSheet({ algorithm, onAlgorithmChange }: SettingsSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0">
          <Gear size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="pb-4">
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Configure your circuit matching preferences
          </SheetDescription>
        </SheetHeader>
        
        <Separator className="my-4" />
        
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Matching Algorithm
            </h3>
            <p className="text-sm text-muted-foreground">
              Choose how circuit similarity is calculated
            </p>
          </div>
          
          <RadioGroup value={algorithm} onValueChange={(value) => onAlgorithmChange(value as MatchAlgorithm)}>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="hausdorff" id="hausdorff" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="hausdorff" className="font-medium cursor-pointer">
                    Hausdorff Distance
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Measures the greatest distance between any point on one shape to the closest point on another. Best for overall shape similarity.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="frechet" id="frechet" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="frechet" className="font-medium cursor-pointer">
                    Fréchet Distance
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Considers the order of points along the path, like walking a dog. Better for comparing directional flow.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="turning-angle" id="turning-angle" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="turning-angle" className="font-medium cursor-pointer">
                    Turning Angle
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Compares the angles at which the path turns at each point. Excellent for matching corner sequences.
                  </p>
                </div>
              </div>
            </div>
          </RadioGroup>
        </div>
      </SheetContent>
    </Sheet>
  )
}
