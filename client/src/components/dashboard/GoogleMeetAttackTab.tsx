import { useState, useEffect } from "react";
import { Video, CheckCircle2, Circle, Clock, Key, Copy } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type MeetStatus = "started" | "joined" | "ongoing" | "finished";

interface StatusStep {
  id: MeetStatus;
  label: string;
  description: string;
}

const STATUS_STEPS: StatusStep[] = [
  { id: "started", label: "Started", description: "Initiating Google Meet connection..." },
  { id: "joined", label: "Joined", description: "Successfully joined the meeting" },
  { id: "ongoing", label: "Ongoing", description: "Voice agent attack in progress..." },
  { id: "finished", label: "Finished", description: "Attack complete. Credentials extracted." },
];

interface ExtractedPassword {
  id: string;
  source: string;
  password: string;
  timestamp: string;
  confidence: number;
}

const EXTRACTED_PASSWORDS: ExtractedPassword[] = [
  {
    id: "1",
    source: "Voice prompt response",
    password: "Tr0ub4dor&3",
    timestamp: "14:32:18",
    confidence: 94,
  },
];

interface GoogleMeetAttackTabProps {
  targetName: string;
}

export default function GoogleMeetAttackTab({ targetName }: GoogleMeetAttackTabProps) {
  const [currentStatus, setCurrentStatus] = useState<MeetStatus>("started");
  const [showPasswords, setShowPasswords] = useState(false);

  // Auto-cycle through statuses
  useEffect(() => {
    const statusOrder: MeetStatus[] = ["started", "joined", "ongoing", "finished"];
    const currentIndex = statusOrder.indexOf(currentStatus);

    if (currentIndex < statusOrder.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStatus(statusOrder[currentIndex + 1]);
      }, 3500);

      return () => clearTimeout(timer);
    } else {
      // Show passwords when finished
      setShowPasswords(true);
    }
  }, [currentStatus]);

  const getStatusIndex = (status: MeetStatus) => {
    return STATUS_STEPS.findIndex((s) => s.id === status);
  };

  const currentStatusIndex = getStatusIndex(currentStatus);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-light tracking-wide text-foreground flex items-center gap-2">
          <Video className="h-6 w-6 text-primary" />
          Google Meet Attack
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Voice agent prompt injection against{" "}
          <span className="text-primary">{targetName}</span>
        </p>
      </div>

      {/* Status Timeline Card */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Attack Status
          </CardTitle>
          <CardDescription>
            Real-time status of the Google Meet voice agent attack
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Timeline */}
          <div className="relative">
            {STATUS_STEPS.map((step, index) => {
              const isCompleted = index < currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              const isPending = index > currentStatusIndex;

              return (
                <div key={step.id} className="flex items-start gap-4 pb-8 last:pb-0">
                  {/* Timeline Line & Dot */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                        isCompleted
                          ? "bg-green-500/20 text-green-500"
                          : isCurrent
                          ? "bg-primary/20 text-primary animate-pulse"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Circle className={`h-5 w-5 ${isCurrent ? "fill-primary" : ""}`} />
                      )}
                    </div>
                    {index < STATUS_STEPS.length - 1 && (
                      <div
                        className={`w-0.5 h-12 transition-all duration-500 ${
                          isCompleted ? "bg-green-500/50" : "bg-border"
                        }`}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-medium ${
                          isCompleted
                            ? "text-green-500"
                            : isCurrent
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </span>
                      {isCurrent && (
                        <Badge
                          variant="outline"
                          className="bg-primary/10 text-primary border-primary/30 text-xs"
                        >
                          Current
                        </Badge>
                      )}
                      {isCompleted && (
                        <Badge
                          variant="outline"
                          className="bg-green-500/10 text-green-500 border-green-500/30 text-xs"
                        >
                          Complete
                        </Badge>
                      )}
                    </div>
                    <p
                      className={`text-sm mt-1 ${
                        isPending ? "text-muted-foreground/50" : "text-muted-foreground"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Extracted Passwords Card */}
      <Card
        className={`bg-card/50 border-border/50 transition-all duration-500 ${
          showPasswords ? "opacity-100" : "opacity-40"
        }`}
      >
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Key className="h-4 w-4 text-destructive" />
            Extracted Credentials
          </CardTitle>
          <CardDescription>
            {showPasswords
              ? "Passwords successfully extracted from voice interaction"
              : "Waiting for attack to complete..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showPasswords ? (
            <div className="space-y-3">
              {EXTRACTED_PASSWORDS.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        Source
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {entry.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground/80">{entry.source}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">
                        Extracted at {entry.timestamp}
                      </p>
                      <code className="text-lg font-mono text-destructive bg-destructive/10 px-3 py-1 rounded">
                        {entry.password}
                      </code>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => copyToClipboard(entry.password)}
                      title="Copy password"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-24 text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                <span className="text-sm">Awaiting extraction...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
