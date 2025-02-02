import { useState, useCallback } from 'react';

interface BluetoothDevice {
  id: string;
  name: string | null;
  status: 'connected' | 'disconnected' | 'pairing';
}

export const useBluetooth = () => {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to device');
      setDevices(prev =>
        prev.map(d =>
          d.id === deviceId ? { ...d, status: 'disconnected' } : d
        )
      );
    }
  }, []);

  return {
    devices,
    isScanning,
    error,
    startScanning,
    connectToDevice,
  };
};
