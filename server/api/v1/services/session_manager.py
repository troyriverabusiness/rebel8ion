# ABOUTME: In-memory session state management for agent sessions.
# ABOUTME: Provides thread-safe CRUD operations for tracking active voice agent sessions.

import asyncio
import uuid
from datetime import datetime
from typing import Dict, Optional

from models.agent_models import AgentSession, SessionStatus


class SessionNotFoundError(Exception):
    """Raised when a session cannot be found by its ID."""

    def __init__(self, session_id: str):
        self.session_id = session_id
        super().__init__(f"Session not found: {session_id}")


class SessionManager:
    """
    Manages in-memory storage of agent sessions.

    Thread-safe through the use of asyncio locks for all mutations.
    Designed for easy replacement with Redis or database backend later.
    """

    def __init__(self) -> None:
        self._sessions: Dict[str, AgentSession] = {}
        self._lock = asyncio.Lock()

    async def create_session(
        self,
        bot_id: str,
        meeting_url: str,
        session_id: Optional[str] = None,
    ) -> AgentSession:
        if session_id is None:
            session_id = str(uuid.uuid4())
        now = datetime.utcnow()

        session = AgentSession(
            session_id=session_id,
            bot_id=bot_id,
            meeting_url=meeting_url,
            # Note: problem_scenario removed - prompt hardcoded in ElevenLabs
            status=SessionStatus.JOINING,
            created_at=now,
            updated_at=now,
        )

        async with self._lock:
            self._sessions[session_id] = session

        return session

    async def get_session(self, session_id: str) -> Optional[AgentSession]:
        async with self._lock:
            return self._sessions.get(session_id)

    async def get_session_or_raise(self, session_id: str) -> AgentSession:
        session = await self.get_session(session_id)
        if session is None:
            raise SessionNotFoundError(session_id)
        return session

    async def update_session_status(
        self,
        session_id: str,
        status: SessionStatus,
        outcome: Optional[str] = None,
        summary: Optional[str] = None,
    ) -> AgentSession:
        async with self._lock:
            session = self._sessions.get(session_id)
            if session is None:
                raise SessionNotFoundError(session_id)

            session.status = status
            session.updated_at = datetime.utcnow()

            if outcome is not None:
                session.outcome = outcome
            if summary is not None:
                session.summary = summary

            return session

    def get_session_duration(self, session: AgentSession) -> int:
        now = datetime.utcnow()
        delta = now - session.created_at
        return int(delta.total_seconds())

    async def list_sessions(self) -> list[AgentSession]:
        async with self._lock:
            return list(self._sessions.values())

    async def delete_session(self, session_id: str) -> bool:
        async with self._lock:
            if session_id in self._sessions:
                del self._sessions[session_id]
                return True
            return False


session_manager = SessionManager()

