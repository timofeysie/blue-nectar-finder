import { useState, useEffect } from 'react';
import { useDeviceMotion } from './useDeviceMotion';

interface StairData {
  isClimbingStairs: boolean;
  stepCount: number;
  totalElevation: number; // in meters
}

interface DetectionConfig {
  windowSize: number;
  peakThreshold: number;
  valleyThreshold: number;
  minCycleTime: number;
  betaMin: number;
  betaMax: number;
}

const DEFAULT_CONFIG: DetectionConfig = {
  windowSize: 10,
  peakThreshold: 1.2,
  valleyThreshold: 0.8,
  minCycleTime: 300,
  betaMin: 20,
  betaMax: 60,
};

export const useStairDetection = (config: Partial<DetectionConfig> = {}) => {
  const { motionData, startSensors } = useDeviceMotion();
  const [detectionConfig, setDetectionConfig] = useState<DetectionConfig>({
    ...DEFAULT_CONFIG,
    ...config
  });
  
  const [stairData, setStairData] = useState<StairData>({
    isClimbingStairs: false,
    stepCount: 0,
    totalElevation: 0,
  });

  const [debugData, setDebugData] = useState({
    currentAcceleration: 0,
    avgAcceleration: 0,
    isPotentialStep: false,
    betaAngle: 0,
  });

  const accelerationWindow: number[] = [];
  let lastPeakTime = 0;
  let isPotentialStep = false;

  useEffect(() => {
    const detectStairStep = () => {
      const { acceleration, rotation } = motionData;
      if (!acceleration.z) return;

      accelerationWindow.push(acceleration.z);
      if (accelerationWindow.length > detectionConfig.windowSize) {
        accelerationWindow.shift();
      }

      const avgAcceleration = accelerationWindow.reduce((a, b) => a + b, 0) / accelerationWindow.length;
      const currentTime = Date.now();
      const timeSinceLastPeak = currentTime - lastPeakTime;

      // Update debug data
      setDebugData({
        currentAcceleration: acceleration.z,
        avgAcceleration,
        isPotentialStep,
        betaAngle: rotation.beta || 0,
      });

      if (!isPotentialStep && 
          avgAcceleration > detectionConfig.peakThreshold && 
          timeSinceLastPeak > detectionConfig.minCycleTime) {
        isPotentialStep = true;
        
        if (rotation.beta && 
            rotation.beta > detectionConfig.betaMin && 
            rotation.beta < detectionConfig.betaMax) {
          setStairData(prev => ({
            isClimbingStairs: true,
            stepCount: prev.stepCount + 1,
            totalElevation: (prev.stepCount + 1) * 0.17,
          }));
          
          lastPeakTime = currentTime;
        }
      } 
      else if (isPotentialStep && avgAcceleration < detectionConfig.valleyThreshold) {
        isPotentialStep = false;
      }

      if (timeSinceLastPeak > 2000) {
        setStairData(prev => ({
          ...prev,
          isClimbingStairs: false,
        }));
      }
    };

    if (motionData.acceleration.z !== null) {
      detectStairStep();
    }
  }, [motionData, detectionConfig]);

  const resetStairCount = () => {
    setStairData({
      isClimbingStairs: false,
      stepCount: 0,
      totalElevation: 0,
    });
  };

  const updateConfig = (newConfig: Partial<DetectionConfig>) => {
    setDetectionConfig(prev => ({
      ...prev,
      ...newConfig
    }));
  };

  return {
    ...stairData,
    debugData,
    config: detectionConfig,
    updateConfig,
    startSensors,
    resetStairCount,
  };
}; 