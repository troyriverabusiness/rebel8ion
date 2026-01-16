import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const TARGETS = ["Cipher", "Phantom", "Vector", "Specter", "Nexus"] as const;

function App() {
  const [selectedTarget, setSelectedTarget] = useState<string>("");

  const handlePenetrate = () => {
    if (selectedTarget) {
      console.log(`[REVEL8] Initiating penetration sequence on target: ${selectedTarget}`);
    } else {
      console.log("[REVEL8] No target selected");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4">
      {/* Subtle grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(168,85,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-12">
        {/* Logo / Title */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-4xl font-light tracking-[0.4em] text-foreground/90">
            REVEL<span className="text-primary text-glow-purple">8</span>
          </h1>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </div>

        {/* Control Panel */}
        <div className="flex flex-col items-center gap-6 w-full max-w-xs">
          {/* Target Selector */}
          <div className="w-full">
            <label className="block text-xs text-muted-foreground mb-2 tracking-wider uppercase">
              Select Target
            </label>
            <Select value={selectedTarget} onValueChange={setSelectedTarget}>
              <SelectTrigger className="w-full h-12 bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border/50">
                {TARGETS.map((target) => (
                  <SelectItem
                    key={target}
                    value={target}
                    className="cursor-pointer hover:bg-primary/10 focus:bg-primary/10 focus:text-foreground"
                  >
                    {target}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Penetrate Button */}
          <Button
            onClick={handlePenetrate}
            disabled={!selectedTarget}
            className="w-full h-12 text-sm tracking-widest uppercase font-medium bg-primary/90 hover:bg-primary hover:glow-purple-sm transition-all duration-300 disabled:opacity-30 disabled:hover:bg-primary/90"
          >
            Penetrate
          </Button>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
          <span className="tracking-wider">SYSTEM READY</span>
        </div>
      </div>
    </div>
  );
}

export default App;
