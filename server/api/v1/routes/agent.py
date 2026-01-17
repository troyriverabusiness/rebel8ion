# ABOUTME: API routes for the voice agent system.
# ABOUTME: Handles agent lifecycle: start, goal completion, and status checking.

import logging
import uuid
from datetime import datetime
from typing import Any, Dict

from fastapi import APIRouter, HTTPException

from api.v1.routes.webhook import broadcast_event
from models.agent_models import (
    GoalCompletedRequest,
    GoalCompletedResponse,
    SessionStatus,
    SessionStatusResponse,
    StartAgentRequest,
    StartAgentResponse,
)
from services.recall_service import RecallAPIError, recall_service
from services.session_manager import SessionNotFoundError, session_manager


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
        request: Contains meeting_url and problem_scenario.

    Returns:
        StartAgentResponse with session_id, status, and bot_id.

    Raises:
        HTTPException: If bot creation fails.
    """
    logger.info(f"Starting agent for meeting: {request.meeting_url}")

    try:
        # Pre-generate session ID (needed for the bot URL before bot creation)
        session_id = str(uuid.uuid4())

        # Create the Recall.ai bot with the pre-generated session_id in its URL
        bot_response = await recall_service.create_bot(
            meeting_url=request.meeting_url,
            problem_scenario=request.problem_scenario,
            session_id=session_id,
        )

        # Extract bot_id from response (Recall.ai returns 'id' field)
        bot_id = bot_response.get("id")
        if not bot_id:
            logger.error(f"Recall.ai response missing bot ID: {bot_response}")
            raise HTTPException(
                status_code=500,
                detail="Failed to create bot: missing bot ID in response",
            )

        # Create the session in our session manager with the pre-generated session_id
        session = await session_manager.create_session(
            bot_id=bot_id,
            meeting_url=request.meeting_url,
            problem_scenario=request.problem_scenario,
            session_id=session_id,
        )

        # Broadcast the agent_started event via SSE
        await broadcast_event({
            "event_type": "agent_started",
            "session_id": session.session_id,
            "bot_id": bot_id,
            "meeting_url": request.meeting_url,
            "status": SessionStatus.JOINING.value,
            "timestamp": datetime.utcnow().isoformat(),
        })

        logger.info(f"Agent session started: {session.session_id}")

        return StartAgentResponse(
            session_id=session.session_id,
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
        # Get the session to retrieve the bot_id
        session = await session_manager.get_session_or_raise(request.session_id)

        # Remove the bot from the call
        try:
            await recall_service.remove_bot_from_call(session.bot_id)
            logger.info(f"Bot {session.bot_id} removed from call")
        except RecallAPIError as e:
            # Log but don't fail - the bot may have already left
            logger.warning(f"Failed to remove bot from call (may have already left): {e}")

        # Update the session status
        await session_manager.update_session_status(
            session_id=request.session_id,
            status=SessionStatus.COMPLETED,
            outcome=request.outcome,
            summary=request.summary,
        )

        # Broadcast the goal_completed event via SSE
        await broadcast_event({
            "event_type": "goal_completed",
            "session_id": request.session_id,
            "bot_id": session.bot_id,
            "outcome": request.outcome,
            "summary": request.summary,
            "status": SessionStatus.COMPLETED.value,
            "timestamp": datetime.utcnow().isoformat(),
        })

        logger.info(f"Session {request.session_id} marked as completed")

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
