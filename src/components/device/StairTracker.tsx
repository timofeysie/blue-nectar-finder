import { useStairDetection } from '../../hooks/useStairDetection';
import { Button } from '../ui/button';

export const StairTracker = () => {
  const { isClimbingStairs, stepCount, totalElevation, startSensors, resetStairCount } = useStairDetection();

  return (
    <div className="p-4 rounded-lg border">
      <h2 className="text-lg font-semibold mb-4">Stair Tracking</h2>
      
      <Button onClick={startSensors} className="mb-4">
        Start Tracking
      </Button>
      
      <div className="space-y-2">
        <p>Status: {isClimbingStairs ? 'Climbing Stairs' : 'Not Climbing'}</p>
        <p>Steps Climbed: {stepCount}</p>
        <p>Total Elevation: {totalElevation.toFixed(2)} meters</p>
      </div>

      <Button 
        onClick={resetStairCount} 
        variant="outline" 
        className="mt-4"
      >
        Reset Counter
      </Button>
    </div>
  );
}; 