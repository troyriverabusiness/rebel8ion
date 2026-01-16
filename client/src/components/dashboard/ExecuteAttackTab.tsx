import { useState } from "react";
import { Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ExecuteAttackTabProps {
  targetName: string;
  isEnabled: boolean;
}

export default function ExecuteAttackTab({
  targetName,
  isEnabled,
}: ExecuteAttackTabProps) {
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecuteAttack = () => {
    if (!isEnabled) return;
    setIsExecuting(true);
    console.log(`[REVEL8] Executing multi-channel attack on target: ${targetName}`);
    // Simulate attack execution
    setTimeout(() => {
      setIsExecuting(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-light tracking-wide text-foreground flex items-center justify-center gap-2">
          <Crosshair className="h-6 w-6 text-primary" />
          Execute Attack
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Multi-channel attack execution against{" "}
          <span className="text-primary">{targetName}</span>
        </p>
      </div>

      {/* Status Card */}
      <Card className="bg-card/50 border-border/50 w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-base font-medium">Attack Status</CardTitle>
          <CardDescription>
            {isEnabled
              ? "OSINT data complete. Ready to execute."
              : "Complete OSINT reconnaissance before executing attack."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isEnabled
                  ? "bg-green-500 animate-pulse"
                  : "bg-muted-foreground/50"
              }`}
            />
            <span
              className={`text-sm uppercase tracking-wider ${
                isEnabled ? "text-green-500" : "text-muted-foreground"
              }`}
            >
              {isEnabled ? "Ready" : "Not Ready"}
            </span>
          </div>

          {/* Execute Button */}
          <Button
            onClick={handleExecuteAttack}
            disabled={!isEnabled || isExecuting}
            size="lg"
            className={`w-full h-14 text-sm tracking-widest uppercase font-medium transition-all duration-300 ${
              isEnabled
                ? "bg-primary/90 hover:bg-primary hover:glow-purple-sm"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {isExecuting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                Executing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Crosshair className="h-4 w-4" />
                Execute Multi-Channel Attack
              </span>
            )}
          </Button>

          {!isEnabled && (
            <p className="text-xs text-muted-foreground text-center">
              Navigate to the OSINT Engine tab to complete reconnaissance
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
