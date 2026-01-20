# ABOUTME: Agent orchestration service (Recall bot + sessions + SSE events + ElevenLabs signed URL).

from __future__ import annotations

import logging
import uuid
from datetime import datetime
from typing import Any, Dict

from config import config
from models.agent_models import SessionStatus

from api.v1.data_access.elevenlabs_client import (
    ElevenLabsAPIError,
    get_conversation_signed_url,
)
from api.v1.data_access.http_client import NetworkRequestError, NetworkTimeoutError
from api.v1.services import event_stream
from api.v1.services.recall_service import RecallAPIError, recall_service
from api.v1.services.session_manager import SessionNotFoundError, session_manager


logger = logging.getLogger(__name__)


async def start_agent(*, meeting_url: str) -> Dict[str, Any]:
    """
    Start a new agent session.

    Returns:
        dict with session_id, bot_id, status
    """
    logger.info(f"Starting agent for meeting: {meeting_url}")

    # Pre-generate session ID (needed for the bot URL before bot creation)
    session_id = str(uuid.uuid4())

    bot_response = await recall_service.create_bot(meeting_url=meeting_url, session_id=session_id)
    bot_id = bot_response.get("id")
    if not bot_id:
        logger.error(f"Recall.ai response missing bot ID: {bot_response}")
        raise ValueError("Failed to create bot: missing bot ID in response")

    session = await session_manager.create_session(bot_id=bot_id, meeting_url=meeting_url, session_id=session_id)

    await event_stream.broadcast_event(
        {
            "event_type": "agent_started",
            "session_id": session.session_id,
            "bot_id": bot_id,
            "meeting_url": meeting_url,
            "status": SessionStatus.JOINING.value,
            "timestamp": datetime.utcnow().isoformat(),
        }
    )

    return {"session_id": session.session_id, "bot_id": bot_id, "status": SessionStatus.JOINING}


async def complete_goal(*, session_id: str, outcome: str, summary: str) -> None:
    logger.info(f"Goal completed for session: {session_id}")
    logger.info(f"Outcome: {outcome}")
    logger.info(f"Summary: {summary}")

    session = await session_manager.get_session_or_raise(session_id)

    try:
        await recall_service.remove_bot_from_call(session.bot_id)
        logger.info(f"Bot {session.bot_id} removed from call")
    except RecallAPIError as e:
        logger.warning(f"Failed to remove bot from call (may have already left): {e}")

    await session_manager.update_session_status(
        session_id=session_id,
        status=SessionStatus.COMPLETED,
        outcome=outcome,
        summary=summary,
    )

    await event_stream.broadcast_event(
        {
            "event_type": "goal_completed",
            "session_id": session_id,
            "bot_id": session.bot_id,
            "outcome": outcome,
            "summary": summary,
            "status": SessionStatus.COMPLETED.value,
            "timestamp": datetime.utcnow().isoformat(),
        }
    )


async def get_elevenlabs_signed_url() -> str:
    """
    Get a signed URL for ElevenLabs WebSocket connection.

    Raises:
        ElevenLabsAPIError, NetworkTimeoutError, NetworkRequestError
    """
    return await get_conversation_signed_url(
        agent_id=config.elevenlabs_agent_id,
        api_key=config.elevenlabs_api_key,
        timeout=30.0,
    )

