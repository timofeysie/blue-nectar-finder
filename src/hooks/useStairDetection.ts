import { useState, useEffect } from 'react';
import { useDeviceMotion } from './useDeviceMotion';

interface StairData {
  isClimbingStairs: boolean;
  stepCount: number;
  totalElevation: number; // in meters
}

export const useStairDetection = () => {
  const { motionData, startSensors } = useDeviceMotion();
  const [stairData, setStairData] = useState<StairData>({
    isClimbingStairs: false,
    stepCount: 0,
    totalElevation: 0,
  });

  // Constants for detection
  const ACCELERATION_THRESHOLD = 1.2; // m/s²
  const STEP_COOLDOWN = 500; // ms
  const AVG_STAIR_HEIGHT = 0.17; // meters (typical stair height)
  
  let lastStepTime = 0;
  let isProcessingStep = false;

  useEffect(() => {
    const detectStairStep = () => {
      const { acceleration, rotation } = motionData;
      const currentTime = Date.now();

      // Check if we're in the cooldown period
      if (currentTime - lastStepTime < STEP_COOLDOWN) {
        return;
      }

      // Vertical acceleration (z-axis) spike indicates potential step
      if (
        acceleration.z !== null &&
        acceleration.z > ACCELERATION_THRESHOLD &&
        !isProcessingStep
      ) {
        isProcessingStep = true;

        // Use rotation data to help confirm it's a stair step
        // When climbing stairs, beta (forward tilt) is typically between 20 and 60 degrees
        if (
          rotation.beta !== null &&
          rotation.beta > 20 &&
          rotation.beta < 60
        ) {
          setStairData(prev => ({
            isClimbingStairs: true,
            stepCount: prev.stepCount + 1,
            totalElevation: (prev.stepCount + 1) * AVG_STAIR_HEIGHT,
          }));

          lastStepTime = currentTime;

          // Reset climbing detection after a period of no steps
          setTimeout(() => {
            setStairData(prev => ({
              ...prev,
              isClimbingStairs: false,
            }));
          }, 2000);
        }

        isProcessingStep = false;
      }
    };

    // Only run detection if we have motion data
    if (motionData.acceleration.z !== null) {
      detectStairStep();
    }
  }, [motionData]);

  const resetStairCount = () => {
    setStairData({
      isClimbingStairs: false,
      stepCount: 0,
      totalElevation: 0,
    });
  };

  return {
    ...stairData,
    startSensors,
    resetStairCount,
  };
}; 