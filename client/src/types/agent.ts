// ABOUTME: TypeScript types for the voice agent API.
// ABOUTME: Mirrors the backend Pydantic models for type-safe API communication.

/**
 * Possible states of an agent session.
 */
export type SessionStatus =
  | "pending"
  | "joining"
  | "active"
  | "completed"
  | "failed";

/**
 * Request payload for starting a new agent session.
 * Note: problem_scenario removed - agent prompt is now hardcoded in ElevenLabs dashboard.
 */
export interface StartAgentRequest {
  meeting_url: string;
}

/**
 * Response after successfully starting an agent session.
 */
export interface StartAgentResponse {
  session_id: string;
  status: SessionStatus;
  bot_id: string;
}

/**
 * Request payload when the agent signals goal completion.
 */
export interface GoalCompletedRequest {
  session_id: string;
  outcome: string;
  summary: string;
}

/**
 * Response acknowledging goal completion.
 */
export interface GoalCompletedResponse {
  acknowledged: boolean;
}

/**
 * Full session status response from the API.
 */
export interface SessionStatusResponse {
  session_id: string;
  status: SessionStatus;
  duration_seconds: number;
  bot_id: string;
  created_at: string;
  meeting_url: string | null;
  outcome: string | null;
  summary: string | null;
}

/**
 * SSE event types for agent lifecycle events.
 */
export type AgentEventType = "agent_started" | "goal_completed";

/**
 * Base interface for agent SSE events.
 */
export interface AgentEventBase {
  event_type: AgentEventType;
  session_id: string;
  bot_id: string;
  status: SessionStatus;
  timestamp: string;
}

/**
 * SSE event when an agent starts.
 */
export interface AgentStartedEvent extends AgentEventBase {
  event_type: "agent_started";
  meeting_url: string;
}

/**
 * SSE event when an agent completes its goal.
 */
export interface GoalCompletedEvent extends AgentEventBase {
  event_type: "goal_completed";
  outcome: string;
  summary: string;
}

/**
 * Union type for all agent SSE events.
 */
export type AgentEvent = AgentStartedEvent | GoalCompletedEvent;

/**
 * Type guard to check if an event is an agent event.
 */
export function isAgentEvent(data: unknown): data is AgentEvent {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  const event = data as Record<string, unknown>;
  return (
    event.event_type === "agent_started" ||
    event.event_type === "goal_completed"
  );
}

/**
 * Type guard for agent_started events.
 */
export function isAgentStartedEvent(
  event: AgentEvent
): event is AgentStartedEvent {
  return event.event_type === "agent_started";
}

/**
 * Type guard for goal_completed events.
 */
export function isGoalCompletedEvent(
  event: AgentEvent
): event is GoalCompletedEvent {
  return event.event_type === "goal_completed";
}
