import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useDeviceMotion } from "@/hooks/useDeviceMotion"
import { Activity, Smartphone } from "lucide-react"
import { useState } from "react"
import { StairTracker } from "./StairTracker"

const DeviceMotionDashboard = () => {
  const { motionData, startSensors } = useDeviceMotion()
  const [error, setError] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(false)

  const handleStartSensors = async () => {
    try {
      await startSensors()
      setIsActive(true)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start motion sensors')
      setIsActive(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-6 w-6" />
            Device Motion Sensors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Button
              onClick={handleStartSensors}
              disabled={isActive}
              className="w-full sm:w-auto"
            >
              {isActive ? 'Sensors Active' : 'Start Sensors'}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Acceleration Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-5 w-5" />
                  Acceleration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">X-Axis:</span>
                    <span className="font-mono">
                      {motionData.acceleration.x?.toFixed(2) || 'N/A'} m/s²
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Y-Axis:</span>
                    <span className="font-mono">
                      {motionData.acceleration.y?.toFixed(2) || 'N/A'} m/s²
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Z-Axis:</span>
                    <span className="font-mono">
                      {motionData.acceleration.z?.toFixed(2) || 'N/A'} m/s²
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rotation Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-5 w-5" />
                  Rotation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Alpha:</span>
                    <span className="font-mono">
                      {motionData.rotation.alpha?.toFixed(2) || 'N/A'}°
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Beta:</span>
                    <span className="font-mono">
                      {motionData.rotation.beta?.toFixed(2) || 'N/A'}°
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gamma:</span>
                    <span className="font-mono">
                      {motionData.rotation.gamma?.toFixed(2) || 'N/A'}°
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              <strong>Note:</strong> Device motion sensors may require permission and
              are not available on all devices or browsers. For best results, use a
              mobile device with modern browser support.
            </p>
          </div>
          <StairTracker />
        </CardContent>
      </Card>
    </div>

  )
}

export default DeviceMotionDashboard 