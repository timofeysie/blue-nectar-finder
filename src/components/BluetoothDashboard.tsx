import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBluetooth } from "@/hooks/useBluetooth";
import { useDeviceMotion } from "@/hooks/useDeviceMotion";
import { Loader2, Bluetooth, Activity } from "lucide-react";

const BluetoothDashboard = () => {
  const { devices, isScanning, error, startScanning, connectToDevice } = useBluetooth();
  const { motionData, startSensors } = useDeviceMotion();

  const handleConnect = async (deviceId: string) => {
    await connectToDevice(deviceId);
    startSensors();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-500';
      case 'pairing':
        return 'text-yellow-500';
      default:
        return 'text-red-500';
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bluetooth className="h-6 w-6" />
            Bluetooth Devices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Button
              onClick={startScanning}
              disabled={isScanning}
              className="w-full sm:w-auto"
            >
              {isScanning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                'Scan for Devices'
              )}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {devices.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No devices found. Click scan to search for nearby Bluetooth devices.
              </p>
            ) : (
              devices.map((device) => (
                <Card key={device.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <h3 className="font-medium">
                        {device.name || 'Unknown Device'}
                      </h3>
                      <p className={`text-sm ${getStatusColor(device.status)}`}>
                        {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleConnect(device.id)}
                      disabled={device.status === 'connected' || device.status === 'pairing'}
                      variant={device.status === 'connected' ? 'secondary' : 'default'}
                    >
                      {device.status === 'pairing' && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {device.status === 'connected' ? 'Connected' : 'Connect'}
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {devices.some(device => device.status === 'connected') && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-6 w-6" />
                  Motion Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Acceleration</h4>
                    <p>X: {motionData.acceleration.x?.toFixed(2) || 'N/A'}</p>
                    <p>Y: {motionData.acceleration.y?.toFixed(2) || 'N/A'}</p>
                    <p>Z: {motionData.acceleration.z?.toFixed(2) || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Rotation</h4>
                    <p>Alpha: {motionData.rotation.alpha?.toFixed(2) || 'N/A'}°</p>
                    <p>Beta: {motionData.rotation.beta?.toFixed(2) || 'N/A'}°</p>
                    <p>Gamma: {motionData.rotation.gamma?.toFixed(2) || 'N/A'}°</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BluetoothDashboard;