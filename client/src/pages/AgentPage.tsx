// ABOUTME: Voice agent page loaded by Recall.ai bot in meetings.
// ABOUTME: Connects to ElevenLabs for voice conversation, signals goal completion to backend.

import { useConversation } from "@elevenlabs/react";
import { useCallback, useEffect, useState, useRef } from "react";
import { apiFetch } from "@/lib/api";

const ELEVENLABS_AGENT_ID =
  import.meta.env.VITE_ELEVENLABS_AGENT_ID || "";

// Match the actual status values from ElevenLabs SDK
type ConnectionStatus = "disconnected" | "connecting" | "connected" | "disconnecting";

interface GoalCompletedParams {
  outcome: string;
  summary: string;
}

export default function AgentPage() {
  const [statusText, setStatusText] = useState<string>("Initializing...");
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const hasStartedRef = useRef(false);

  // Helper to add visible logs
  const addLog = (message: string) => {
    console.log(`[AgentPage] ${message}`);
    setLogs((prev) => [...prev.slice(-9), `${new Date().toISOString().slice(11, 19)} ${message}`]);
  };

  // Parse URL params from Recall.ai bot URL
  // Note: scenario removed - agent prompt is now hardcoded in ElevenLabs dashboard
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("session_id") || "";

  // Log on mount
  useEffect(() => {
    addLog(`Page loaded. URL: ${window.location.href}`);
    addLog(`Agent ID configured: ${ELEVENLABS_AGENT_ID ? "yes" : "NO"}`);
    addLog(`Session ID: ${sessionId || "MISSING"}`);
  }, []);

  /**
   * Signal goal completion to the backend API.
   * This triggers bot removal from the call and session status update.
   */
  const signalGoalCompleted = useCallback(
    async (outcome: string, summary: string): Promise<string> => {
      if (!sessionId) {
        console.error("Cannot signal goal completion: missing session_id");
        return "Error: missing session_id";
      }

      try {
        const response = await apiFetch("/api/v1/agent/goal-completed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            outcome,
            summary,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Failed to signal goal completion:", errorText);
          return `Error: ${response.status}`;
        }

        console.log("Goal completion signaled successfully");
        return "Goal completion acknowledged by backend";
      } catch (err) {
        console.error("Failed to signal goal completion:", err);
        return `Error: ${err instanceof Error ? err.message : "Unknown error"}`;
      }
    },
    [sessionId]
  );

  /**
   * Initialize the ElevenLabs conversation with client tools and event handlers.
   * Note: Agent prompt is hardcoded in ElevenLabs dashboard, no overrides needed.
   */
  const conversation = useConversation({
    clientTools: {
      // Client tool that can be invoked by the ElevenLabs agent when goal is achieved
      signal_goal_completed: async (
        parameters: GoalCompletedParams
      ): Promise<string> => {
        const result = await signalGoalCompleted(
          parameters.outcome,
          parameters.summary
        );
        return result;
      },
    },
    onConnect: () => {
      console.log("ElevenLabs conversation connected");
      setStatusText("Connected - Agent active");
      setError(null);
    },
    onDisconnect: () => {
      console.log("ElevenLabs conversation disconnected");
      setStatusText("Disconnected");
    },
    onError: (err: unknown) => {
      console.error("ElevenLabs conversation error:", err);
      const errorMessage = typeof err === "string" ? err : (err as Error)?.message || "Unknown error";
      setError(errorMessage);
      setStatusText(`Error: ${errorMessage}`);
    },
    onMessage: (message) => {
      console.log("ElevenLabs message:", message);
    },
    onStatusChange: (status) => {
      console.log("ElevenLabs status change:", status);
    },
  });

  /**
   * Start the ElevenLabs conversation session on component mount.
   */
  useEffect(() => {
    // Prevent double-start in React StrictMode
    if (hasStartedRef.current) {
      return;
    }

    const startSession = async () => {
      // Validate required configuration
      if (!sessionId) {
        setError("Missing session_id in URL parameters");
        setStatusText("Configuration error");
        return;
      }

      hasStartedRef.current = true;
      setStatusText("Requesting microphone access...");
      addLog("Requesting microphone access...");

      try {
        // Request microphone permission (in Recall.ai, this returns meeting audio)
        addLog("Calling getUserMedia...");
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        addLog(`Got media stream: ${stream.getAudioTracks().length} audio tracks`);

        // Get signed URL from backend for WebSocket authentication
        // WebSocket mode works better in Recall.ai's headless browser environment
        setStatusText("Getting authentication...");
        addLog("Fetching signed URL from backend...");
        const signedUrlResponse = await apiFetch("/api/v1/agent/signed-url");

        if (!signedUrlResponse.ok) {
          const errorText = await signedUrlResponse.text();
          throw new Error(`Failed to get signed URL: ${signedUrlResponse.status} - ${errorText}`);
        }

        const { signed_url: signedUrl } = await signedUrlResponse.json();
        addLog("Got signed URL, connecting to ElevenLabs...");
        setStatusText("Connecting to ElevenLabs...");

        // Start the conversation session with WebSocket mode (works better in headless browsers)
        addLog("Starting ElevenLabs session with WebSocket mode...");
        const conversationId = await conversation.startSession({
          signedUrl,
          connectionType: "websocket",
        });

        addLog(`ElevenLabs session started: ${conversationId}`);
        setStatusText("Connected - Conversation active");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        addLog(`ERROR: ${errorMessage}`);
        console.error("[AgentPage] Failed to start ElevenLabs session:", err);
        setError(errorMessage);
        setStatusText(`Failed: ${errorMessage}`);
        hasStartedRef.current = false;
      }
    };

    startSession();

    // Cleanup on unmount
    return () => {
      if (hasStartedRef.current) {
        conversation.endSession().catch(console.error);
      }
    };
  }, [conversation, sessionId]);

  /**
   * Get the status indicator color based on connection status.
   */
  const getStatusColor = (status: ConnectionStatus): string => {
    switch (status) {
      case "connected":
        return "bg-green-500";
      case "connecting":
        return "bg-yellow-500 animate-pulse";
      case "disconnecting":
        return "bg-yellow-500";
      case "disconnected":
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4">
        {/* Status indicator */}
        <div className="flex items-center gap-3 bg-gray-800 px-4 py-3 rounded-lg">
          <div
            className={`w-3 h-3 rounded-full ${getStatusColor(conversation.status)}`}
          />
          <span className="text-gray-200 text-sm font-medium">{statusText}</span>
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg text-sm max-w-md">
            {error}
          </div>
        )}

        {/* Debug info - always visible for troubleshooting */}
        <div className="text-gray-500 text-xs font-mono mt-4 space-y-1">
          <div>Session: {sessionId || "none"}</div>
          <div>Agent: {ELEVENLABS_AGENT_ID ? `${ELEVENLABS_AGENT_ID.slice(0, 10)}...` : "none"}</div>
          <div>Status: {conversation.status}</div>
          <div>isSpeaking: {String(conversation.isSpeaking)}</div>
        </div>

        {/* Live logs */}
        <div className="mt-4 w-full max-w-md bg-black/50 p-2 rounded text-xs font-mono text-green-400 space-y-0.5 max-h-40 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-gray-600">Waiting for logs...</div>
          ) : (
            logs.map((log, i) => <div key={i}>{log}</div>)
          )}
        </div>
      </div>
    </div>
  );
}
