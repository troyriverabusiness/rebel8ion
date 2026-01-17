# ABOUTME: Pydantic models for the voice agent API endpoints.
# ABOUTME: Defines request/response schemas and internal session state model.

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, HttpUrl


class SessionStatus(str, Enum):
    """
    Enumeration of possible agent session states.

    Using str as base class allows direct JSON serialization.
    """

    PENDING = "pending"
    JOINING = "joining"
    ACTIVE = "active"
    COMPLETED = "completed"
    FAILED = "failed"


# =============================================================================
# Request Models
# =============================================================================


class StartAgentRequest(BaseModel):
    """Request payload for starting a new agent session."""

    meeting_url: str = Field(
        ...,
        description="Google Meet URL for the agent to join",
        examples=["https://meet.google.com/abc-defg-hij"],
    )
    # Note: problem_scenario removed - agent prompt is now hardcoded in ElevenLabs dashboard


class GoalCompletedRequest(BaseModel):
    """Request payload when the agent signals goal completion."""

    session_id: str = Field(
        ...,
        description="The session ID of the completed agent session",
    )
    outcome: str = Field(
        ...,
        description="The outcome of the agent's goal (e.g., 'resolved', 'escalated', 'failed')",
    )
    summary: str = Field(
        ...,
        description="Summary of what happened during the conversation",
        max_length=5000,
    )


# =============================================================================
# Response Models
# =============================================================================


class StartAgentResponse(BaseModel):
    """Response after successfully starting an agent session."""

    session_id: str = Field(
        ...,
        description="Unique identifier for this agent session",
    )
    status: SessionStatus = Field(
        ...,
        description="Current status of the agent session",
    )
    bot_id: str = Field(
        ...,
        description="Recall.ai bot ID for the created bot",
    )


class GoalCompletedResponse(BaseModel):
    """Response acknowledging goal completion."""

    acknowledged: bool = Field(
        ...,
        description="Whether the goal completion was successfully acknowledged",
    )


class SessionStatusResponse(BaseModel):
    """Response containing the current status of an agent session."""

    session_id: str = Field(
        ...,
        description="Unique identifier for this agent session",
    )
    status: SessionStatus = Field(
        ...,
        description="Current status of the agent session",
    )
    duration_seconds: int = Field(
        ...,
        description="Duration of the session in seconds",
    )
    bot_id: str = Field(
        ...,
        description="Recall.ai bot ID for the session",
    )
    created_at: datetime = Field(
        ...,
        description="Timestamp when the session was created",
    )
    meeting_url: Optional[str] = Field(
        default=None,
        description="The Google Meet URL the agent joined",
    )
    outcome: Optional[str] = Field(
        default=None,
        description="The outcome if the session is completed",
    )
    summary: Optional[str] = Field(
        default=None,
        description="Summary of the conversation if completed",
    )


# =============================================================================
# Internal State Models
# =============================================================================


class AgentSession(BaseModel):
    """
    Internal model representing an agent session's full state.

    This is used for in-memory storage and is not directly exposed via API.
    """

    session_id: str
    bot_id: str
    meeting_url: str
    problem_scenario: Optional[str] = None  # Now optional - prompt hardcoded in ElevenLabs
    status: SessionStatus = SessionStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    outcome: Optional[str] = None
    summary: Optional[str] = None

    class Config:
        """Pydantic model configuration."""

        # Allow mutation for status updates
        frozen = False
