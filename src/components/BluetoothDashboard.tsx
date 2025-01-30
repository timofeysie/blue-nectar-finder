import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBluetooth } from "@/hooks/useBluetooth";
import { Loader2, Bluetooth } from "lucide-react";

const BluetoothDashboard = () => {
  const { devices, isScanning, error, startScanning, connectToDevice } = useBluetooth();

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
                      onClick={() => connectToDevice(device.id)}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default BluetoothDashboard;