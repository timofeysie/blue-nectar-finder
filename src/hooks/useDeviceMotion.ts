import { useState, useCallback, useEffect } from 'react';

interface MotionData {
  acceleration: {
    x: number | null;
    y: number | null;
    z: number | null;
  };
  rotation: {
    alpha: number | null;
    beta: number | null;
    gamma: number | null;
  };
}

// Define the requestPermission function type
interface DeviceMotionEventWithPermission extends DeviceMotionEvent {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

// Create a type for the DeviceMotionEvent constructor
interface DeviceMotionEventStatic {
  new(): DeviceMotionEvent;
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

export const useDeviceMotion = () => {
  const [motionData, setMotionData] = useState<MotionData>({
    acceleration: { x: null, y: null, z: null },
    rotation: { alpha: null, beta: null, gamma: null }
  });

  const handleDeviceMotion = (event: DeviceMotionEvent) => {
    if (event.acceleration) {
      setMotionData(prev => ({
        ...prev,
        acceleration: {
          x: event.acceleration.x,
          y: event.acceleration.y,
          z: event.acceleration.z
        }
      }));
    }
  };

  const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
    setMotionData(prev => ({
      ...prev,
      rotation: {
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma
      }
    }));
  };

  const startSensors = useCallback(() => {
    const DeviceMotionEventWithPermission = DeviceMotionEvent as unknown as DeviceMotionEventStatic;
    
    if (typeof DeviceMotionEventWithPermission.requestPermission === 'function') {
      DeviceMotionEventWithPermission.requestPermission()
        .then(response => {
          if (response === 'granted') {
            window.addEventListener('devicemotion', handleDeviceMotion);
            window.addEventListener('deviceorientation', handleDeviceOrientation);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('devicemotion', handleDeviceMotion);
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }
  }, []);

  useEffect(() => {
    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, []);

  return {
    motionData,
    startSensors
  };
}; 