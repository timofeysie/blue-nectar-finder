import BluetoothDashboard from "@/components/BluetoothDashboard";
import DeviceMotionDashboard from "@/components/DeviceMotionDashboard";
import Header from "@/components/Header";
import XRPLedgeDashboard from "@/components/XRPLedgeDashboard";

const Index = () => {
  return (
    <div>
      <Header />
      <BluetoothDashboard />
      <XRPLedgeDashboard />
      <DeviceMotionDashboard />
    </div>
  );
};

export default Index;