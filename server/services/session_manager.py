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
        problem_scenario: str,
        session_id: Optional[str] = None,
    ) -> AgentSession:
        """
        Create a new agent session.

        Args:
            bot_id: The Recall.ai bot ID.
            meeting_url: The Google Meet URL.
            problem_scenario: The scenario for the agent.
            session_id: Optional pre-generated session ID. If not provided,
                        a new UUID will be generated.

        Returns:
            The newly created AgentSession.
        """
        if session_id is None:
            session_id = str(uuid.uuid4())
        now = datetime.utcnow()

        session = AgentSession(
            session_id=session_id,
            bot_id=bot_id,
            meeting_url=meeting_url,
            problem_scenario=problem_scenario,
            status=SessionStatus.JOINING,
            created_at=now,
            updated_at=now,
        )

        async with self._lock:
            self._sessions[session_id] = session

        return session

    async def get_session(self, session_id: str) -> Optional[AgentSession]:
        """
        Retrieve a session by its ID.

        Args:
            session_id: The session ID to look up.

        Returns:
            The AgentSession if found, None otherwise.
        """
        async with self._lock:
            return self._sessions.get(session_id)

    async def get_session_or_raise(self, session_id: str) -> AgentSession:
        """
        Retrieve a session by its ID, raising an error if not found.

        Args:
            session_id: The session ID to look up.

        Returns:
            The AgentSession.

        Raises:
            SessionNotFoundError: If the session is not found.
        """
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
        """
        Update a session's status and optionally its outcome/summary.

        Args:
            session_id: The session ID to update.
            status: The new status.
            outcome: Optional outcome string (for completed sessions).
            summary: Optional summary string (for completed sessions).

        Returns:
            The updated AgentSession.

        Raises:
            SessionNotFoundError: If the session is not found.
        """
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
        """
        Calculate the duration of a session in seconds.

        Args:
            session: The session to calculate duration for.

        Returns:
            Duration in seconds since session creation.
        """
        now = datetime.utcnow()
        delta = now - session.created_at
        return int(delta.total_seconds())

    async def list_sessions(self) -> list[AgentSession]:
        """
        List all sessions.

        Returns:
            A list of all AgentSession instances.
        """
        async with self._lock:
            return list(self._sessions.values())

    async def delete_session(self, session_id: str) -> bool:
        """
        Delete a session by its ID.

        Args:
            session_id: The session ID to delete.

        Returns:
            True if the session was deleted, False if it didn't exist.
        """
        async with self._lock:
            if session_id in self._sessions:
                del self._sessions[session_id]
                return True
            return False


# Module-level singleton instance for use across the application
session_manager = SessionManager()
