// ABOUTME: Google Meet voice agent attack tab with real API integration.
// ABOUTME: Allows starting agent sessions and displays real-time status via SSE.

import { useState, useEffect, useCallback } from "react";
import {
  Video,
  CheckCircle2,
  Circle,
  Clock,
  MessageSquare,
  Play,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type SessionStatus,
  type StartAgentResponse,
  type AgentEvent,
  isAgentEvent,
  isAgentStartedEvent,
  isGoalCompletedEvent,
} from "@/types/agent";
import { apiFetch, createSSEConnection } from "@/lib/api";

type MeetStatus = "idle" | "starting" | "joining" | "active" | "completed" | "failed";

interface StatusStep {
  id: MeetStatus;
  label: string;
  description: string;
}

const STATUS_STEPS: StatusStep[] = [
  { id: "starting", label: "Starting", description: "Initiating voice agent..." },
  { id: "joining", label: "Joining", description: "Bot is joining the meeting..." },
  { id: "active", label: "Active", description: "Voice agent conversation in progress..." },
  { id: "completed", label: "Completed", description: "Goal achieved. Session complete." },
];

interface AgentSession {
  sessionId: string;
  botId: string;
  status: MeetStatus;
  meetingUrl: string;
  outcome?: string;
  summary?: string;
}

interface GoogleMeetAttackTabProps {
  targetName: string;
}

export default function GoogleMeetAttackTab({ targetName }: GoogleMeetAttackTabProps) {
  // Form state - problem_scenario removed (now hardcoded in ElevenLabs dashboard)
  const [meetingUrl, setMeetingUrl] = useState<string>("");

  // Session state
  const [session, setSession] = useState<AgentSession | null>(null);
  const [currentStatus, setCurrentStatus] = useState<MeetStatus>("idle");
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Map backend SessionStatus to our local MeetStatus.
   */
  const mapSessionStatus = (status: SessionStatus): MeetStatus => {
    switch (status) {
      case "pending":
      case "joining":
        return "joining";
      case "active":
        return "active";
      case "completed":
        return "completed";
      case "failed":
        return "failed";
      default:
        return "idle";
    }
  };

  /**
   * Handle SSE events from the backend.
   */
  const handleAgentEvent = useCallback((event: AgentEvent) => {
    // Only process events for our session
    if (session && event.session_id !== session.sessionId) {
      return;
    }

    if (isAgentStartedEvent(event)) {
      setCurrentStatus("joining");
      setSession((prev) =>
        prev
          ? { ...prev, status: "joining" }
          : {
              sessionId: event.session_id,
              botId: event.bot_id,
              status: "joining",
              meetingUrl: event.meeting_url,
            }
      );
    } else if (isGoalCompletedEvent(event)) {
      setCurrentStatus("completed");
      setSession((prev) =>
        prev
          ? {
              ...prev,
              status: "completed",
              outcome: event.outcome,
              summary: event.summary,
            }
          : null
      );
    }
  }, [session]);

  /**
   * Listen for SSE events.
   */
  useEffect(() => {
    const disconnect = createSSEConnection("/api/v1/webhook/stream", {
      onMessage: (data) => {
        if (isAgentEvent(data)) {
          handleAgentEvent(data);
        }
      },
      onError: (err) => {
        console.error("SSE connection error:", err);
      },
    });

    return disconnect;
  }, [handleAgentEvent]);

  /**
   * Start a new agent session.
   */
  const handleStartAgent = async () => {
    if (!meetingUrl.trim()) {
      setError("Please enter a Google Meet URL");
      return;
    }

    setIsStarting(true);
    setError(null);
    setCurrentStatus("starting");

    try {
      const response = await apiFetch("/api/v1/agent/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meeting_url: meetingUrl.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to start agent: ${response.status}`);
      }

      const data: StartAgentResponse = await response.json();

      setSession({
        sessionId: data.session_id,
        botId: data.bot_id,
        status: mapSessionStatus(data.status),
        meetingUrl: meetingUrl.trim(),
      });

      setCurrentStatus(mapSessionStatus(data.status));
    } catch (err) {
      console.error("Error starting agent:", err);
      setError(err instanceof Error ? err.message : "Failed to start agent");
      setCurrentStatus("failed");
    } finally {
      setIsStarting(false);
    }
  };

  /**
   * Reset the form and session state.
   */
  const handleReset = () => {
    setSession(null);
    setCurrentStatus("idle");
    setError(null);
    setMeetingUrl("");
  };

  /**
   * Get the index of a status in the timeline.
   */
  const getStatusIndex = (status: MeetStatus): number => {
    const index = STATUS_STEPS.findIndex((s) => s.id === status);
    return index >= 0 ? index : -1;
  };

  const currentStatusIndex = getStatusIndex(currentStatus);
  const isIdle = currentStatus === "idle";
  const isCompleted = currentStatus === "completed";
  const isFailed = currentStatus === "failed";

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

      {/* Configuration Card - Only show when idle or failed */}
      {(isIdle || isFailed) && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Play className="h-4 w-4 text-primary" />
              Start Agent Session
            </CardTitle>
            <CardDescription>
              Configure and launch the voice agent to join a Google Meet call
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Meeting URL Input */}
            <div className="space-y-2">
              <label
                htmlFor="meeting-url"
                className="text-sm font-medium text-foreground"
              >
                Google Meet URL
              </label>
              <input
                id="meeting-url"
                type="url"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <p className="text-xs text-muted-foreground">
                The agent behavior is configured in the ElevenLabs dashboard.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Start Button */}
            <Button
              onClick={handleStartAgent}
              disabled={isStarting}
              className="w-full"
            >
              {isStarting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting Agent...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Voice Agent
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Status Timeline Card - Show when session is active */}
      {!isIdle && !isFailed && (
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
                const stepIndex = getStatusIndex(step.id);
                const isStepCompleted = stepIndex < currentStatusIndex;
                const isStepCurrent = stepIndex === currentStatusIndex;
                const isStepPending = stepIndex > currentStatusIndex;

                return (
                  <div key={step.id} className="flex items-start gap-4 pb-8 last:pb-0">
                    {/* Timeline Line & Dot */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                          isStepCompleted
                            ? "bg-green-500/20 text-green-500"
                            : isStepCurrent
                            ? "bg-primary/20 text-primary animate-pulse"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isStepCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <Circle
                            className={`h-5 w-5 ${isStepCurrent ? "fill-primary" : ""}`}
                          />
                        )}
                      </div>
                      {index < STATUS_STEPS.length - 1 && (
                        <div
                          className={`w-0.5 h-12 transition-all duration-500 ${
                            isStepCompleted ? "bg-green-500/50" : "bg-border"
                          }`}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${
                            isStepCompleted
                              ? "text-green-500"
                              : isStepCurrent
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </span>
                        {isStepCurrent && (
                          <Badge
                            variant="outline"
                            className="bg-primary/10 text-primary border-primary/30 text-xs"
                          >
                            Current
                          </Badge>
                        )}
                        {isStepCompleted && (
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
                          isStepPending
                            ? "text-muted-foreground/50"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Session Info */}
            {session && (
              <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground font-mono space-y-1">
                <div>Session: {session.sessionId}</div>
                <div>Bot: {session.botId}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Card - Show when completed */}
      {isCompleted && session && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-green-500" />
              Conversation Results
            </CardTitle>
            <CardDescription>
              Summary of the voice agent conversation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Outcome */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Outcome
                </span>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    session.outcome === "resolved"
                      ? "bg-green-500/10 text-green-500 border-green-500/30"
                      : session.outcome === "escalated"
                      ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"
                      : "bg-red-500/10 text-red-500 border-red-500/30"
                  }`}
                >
                  {session.outcome || "Unknown"}
                </Badge>
              </div>
            </div>

            {/* Summary */}
            {session.summary && (
              <div className="space-y-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Summary
                </span>
                <div className="p-3 bg-background/50 border border-border/50 rounded-md">
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                    {session.summary}
                  </p>
                </div>
              </div>
            )}

            {/* Reset Button */}
            <Button variant="outline" onClick={handleReset} className="w-full">
              Start New Session
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Failed State */}
      {isFailed && (
        <Card className="bg-card/50 border-destructive/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Session Failed</p>
                <p className="text-sm text-destructive/80">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
