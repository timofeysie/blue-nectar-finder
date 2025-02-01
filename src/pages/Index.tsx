import BluetoothDashboard from "@/components/BluetoothDashboard";
import Header from "@/components/Header";
import XRPLedgeDashboard from "@/components/XRPLedgeDashboard";

const Index = () => {
  return (
    <div>
      <Header />
      <BluetoothDashboard />
      <XRPLedgeDashboard />
    </div>
  );
};

export default Index;