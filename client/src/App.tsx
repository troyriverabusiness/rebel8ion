import { useState } from "react";
import Dashboard from "@/pages/Dashboard";
import TargetSelection from "@/pages/TargetSelection";

type ViewType = "target-selection" | "dashboard";

function App() {
  const [selectedTarget, setSelectedTarget] = useState<string>("");
  const [currentView, setCurrentView] = useState<ViewType>("target-selection");

  const handlePenetrate = () => {
    setCurrentView("dashboard");
  };

  const handleBackToTargetSelection = () => {
    setCurrentView("target-selection");
  };

  if (currentView === "dashboard" && selectedTarget) {
    return (
      <Dashboard
        targetName={selectedTarget}
        onBack={handleBackToTargetSelection}
      />
    );
  }

  return (
    <TargetSelection
      selectedTarget={selectedTarget}
      onTargetChange={setSelectedTarget}
      onPenetrate={handlePenetrate}
    />
  );
}

export default App;
