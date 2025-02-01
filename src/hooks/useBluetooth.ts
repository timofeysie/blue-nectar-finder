import { useState, useCallback, useEffect } from 'react';

interface BluetoothDevice {
  id: string;
  name: string | null;
  status: 'connected' | 'disconnected' | 'pairing';
}

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

export const useBluetooth = () => {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const startScanning = useCallback(async () => {
    if (!navigator.bluetooth) {
      setError('Bluetooth is not supported in this browser');
      return;
    }

    try {
      setIsScanning(true);
      setError(null);
      
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
      });

      const newDevice: BluetoothDevice = {
        id: device.id,
        name: device.name,
        status: 'disconnected',
      };

      setDevices(prev => {
        const exists = prev.some(d => d.id === device.id);
        if (!exists) {
          return [...prev, newDevice];
        }
        return prev;
      });

      device.addEventListener('gattserverdisconnected', () => {
        setDevices(prev =>
          prev.map(d =>
            d.id === device.id ? { ...d, status: 'disconnected' } : d
          )
        );
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan for devices');
    } finally {
      setIsScanning(false);
    }
  }, []);

  const connectToDevice = useCallback(async (deviceId: string) => {
    try {
      setDevices(prev =>
        prev.map(d =>
          d.id === deviceId ? { ...d, status: 'pairing' } : d
        )
      );

      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
      });
      
      const server = await device.gatt?.connect();
      
      if (server) {
        setDevices(prev =>
          prev.map(d =>
            d.id === deviceId ? { ...d, status: 'connected' } : d
          )
        );
        startSensors();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to device');
      setDevices(prev =>
        prev.map(d =>
          d.id === deviceId ? { ...d, status: 'disconnected' } : d
        )
      );
    }
  }, [startSensors]);

  useEffect(() => {
    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, []);

  return {
    devices,
    isScanning,
    error,
    startScanning,
    connectToDevice,
    motionData
  };
};
