import { useStairDetection } from '@/hooks/useStairDetection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const StairTracker = () => {
  const {
    isClimbingStairs,
    stepCount,
    totalElevation,
    debugData,
    config,
    updateConfig,
    startSensors,
    resetStairCount
  } = useStairDetection();

  const handleConfigChange = (key: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      updateConfig({ [key]: numValue });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Stair Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>Status: {isClimbingStairs ? 'Climbing Stairs' : 'Not Climbing'}</p>
            <p>Steps Climbed: {stepCount}</p>
            <p>Total Elevation: {totalElevation.toFixed(2)} meters</p>
            
            <div className="flex gap-4">
              <Button onClick={startSensors}>Start Tracking</Button>
              <Button variant="outline" onClick={resetStairCount}>Reset</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Debug Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>Current Acceleration: {debugData.currentAcceleration.toFixed(3)}</p>
            <p>Average Acceleration: {debugData.avgAcceleration.toFixed(3)}</p>
            <p>Potential Step: {debugData.isPotentialStep ? 'Yes' : 'No'}</p>
            <p>Beta Angle: {debugData.betaAngle.toFixed(1)}°</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(config).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{key}</Label>
                <Input
                  id={key}
                  type="number"
                  step="0.1"
                  value={value}
                  onChange={(e) => handleConfigChange(key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 