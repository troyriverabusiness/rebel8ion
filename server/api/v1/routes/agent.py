# ABOUTME: API routes for the voice agent system.
# ABOUTME: Handles agent lifecycle: start, goal completion, and status checking.

import logging
from typing import Any, Dict

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from models.agent_models import (
    GoalCompletedRequest,
    GoalCompletedResponse,
    SessionStatus,
    SessionStatusResponse,
    StartAgentRequest,
    StartAgentResponse,
)
from api.v1.data_access.elevenlabs_client import ElevenLabsAPIError
from api.v1.data_access.http_client import NetworkRequestError, NetworkTimeoutError
from api.v1.services import agent_service
from api.v1.services.recall_service import RecallAPIError
from api.v1.services.session_manager import SessionNotFoundError, session_manager


# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/agent/start", response_model=StartAgentResponse)
async def start_agent(request: StartAgentRequest) -> StartAgentResponse:
    """
    Start a new voice agent session.

    Creates a Recall.ai bot that joins the specified Google Meet meeting
    and loads the agent webpage for voice interaction via ElevenLabs.

    Args:
        request: Contains meeting_url.

    Returns:
        StartAgentResponse with session_id, status, and bot_id.

    Raises:
        HTTPException: If bot creation fails.
    """
    logger.info(f"Starting agent for meeting: {request.meeting_url}")

    try:
        result = await agent_service.start_agent(meeting_url=request.meeting_url)
        session_id = result["session_id"]
        bot_id = result["bot_id"]
        return StartAgentResponse(
            session_id=session_id,
            status=SessionStatus.JOINING,
            bot_id=bot_id,
        )

    except RecallAPIError as e:
        logger.error(f"Recall.ai API error: {e}")
        raise HTTPException(
            status_code=502,
            detail=f"Failed to create meeting bot: {str(e)}",
        )
    except Exception as e:
        logger.error(f"Unexpected error starting agent: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start agent: {str(e)}",
        )


@router.post("/agent/goal-completed", response_model=GoalCompletedResponse)
async def goal_completed(request: GoalCompletedRequest) -> GoalCompletedResponse:
    """
    Signal that the agent has completed its goal.

    Called by the agent webpage when the ElevenLabs agent signals completion.
    This endpoint removes the bot from the call and updates the session status.

    Args:
        request: Contains session_id, outcome, and summary.

    Returns:
        GoalCompletedResponse with acknowledged=True.

    Raises:
        HTTPException: If session not found or bot removal fails.
    """
    logger.info(f"Goal completed for session: {request.session_id}")
    logger.info(f"Outcome: {request.outcome}")
    logger.info(f"Summary: {request.summary}")

    try:
        await agent_service.complete_goal(
            session_id=request.session_id,
            outcome=request.outcome,
            summary=request.summary,
        )
        return GoalCompletedResponse(acknowledged=True)

    except SessionNotFoundError:
        logger.error(f"Session not found: {request.session_id}")
        raise HTTPException(
            status_code=404,
            detail=f"Session not found: {request.session_id}",
        )
    except Exception as e:
        logger.error(f"Unexpected error completing goal: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to complete goal: {str(e)}",
        )


@router.get("/agent/status/{session_id}", response_model=SessionStatusResponse)
async def get_session_status(session_id: str) -> SessionStatusResponse:
    """
    Get the current status of an agent session.

    Args:
        session_id: The session ID to look up.

    Returns:
        SessionStatusResponse with full session details.

    Raises:
        HTTPException: If session not found.
    """
    logger.debug(f"Getting status for session: {session_id}")

    try:
        session = await session_manager.get_session_or_raise(session_id)
        duration = session_manager.get_session_duration(session)

        return SessionStatusResponse(
            session_id=session.session_id,
            status=session.status,
            duration_seconds=duration,
            bot_id=session.bot_id,
            created_at=session.created_at,
            meeting_url=session.meeting_url,
            outcome=session.outcome,
            summary=session.summary,
        )

    except SessionNotFoundError:
        raise HTTPException(
            status_code=404,
            detail=f"Session not found: {session_id}",
        )


@router.get("/agent/sessions")
async def list_sessions() -> Dict[str, Any]:
    """
    List all agent sessions.

    Returns:
        A dict containing the total count and list of sessions.
    """
    sessions = await session_manager.list_sessions()

    return {
        "total": len(sessions),
        "sessions": [
            {
                "session_id": s.session_id,
                "status": s.status.value,
                "bot_id": s.bot_id,
                "meeting_url": s.meeting_url,
                "created_at": s.created_at.isoformat(),
                "duration_seconds": session_manager.get_session_duration(s),
            }
            for s in sessions
        ],
    }


class SignedUrlResponse(BaseModel):
    """Response model for signed URL endpoint."""
    signed_url: str


@router.get("/agent/signed-url", response_model=SignedUrlResponse)
async def get_signed_url() -> SignedUrlResponse:
    """
    Get a signed URL for ElevenLabs WebSocket connection.

    This endpoint is called by the agent webpage to authenticate
    with ElevenLabs using WebSocket mode instead of WebRTC.
    WebSocket mode works better in headless browser environments like Recall.ai.

    Returns:
        SignedUrlResponse with the signed URL for WebSocket connection.

    Raises:
        HTTPException: If the ElevenLabs API call fails.
    """
    logger.info("Requesting ElevenLabs signed URL")

    try:
        signed_url = await agent_service.get_elevenlabs_signed_url()
        logger.info("Successfully obtained ElevenLabs signed URL")
        return SignedUrlResponse(signed_url=signed_url)

    except NetworkTimeoutError as e:
        logger.error(f"Timeout getting signed URL: {e}")
        raise HTTPException(
            status_code=504,
            detail="Request to ElevenLabs timed out",
        )
    except NetworkRequestError as e:
        logger.error(f"Request error getting signed URL: {e}")
        raise HTTPException(
            status_code=502,
            detail=f"Failed to connect to ElevenLabs: {e}",
        )
    except ElevenLabsAPIError as e:
        raise HTTPException(
            status_code=502,
            detail=str(e),
        )
