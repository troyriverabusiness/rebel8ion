# ABOUTME: Recall.ai service wrapper (business-facing) over the raw HTTP client.
# ABOUTME: Exposes a stable interface used by agent orchestration.

from __future__ import annotations

from typing import Any, Dict, Optional
from urllib.parse import urlencode

from api.v1.data_access import recall_client


RecallAPIError = recall_client.RecallAPIError


class RecallService:
    """
    Client for interacting with the Recall.ai API.

    Handles authentication and bot lifecycle management.
    """

    def __init__(self, api_key: str, base_url: str, agent_webpage_url: str) -> None:
        self._cfg = recall_client.RecallClientConfig(api_key=api_key, base_url=base_url)
        self._agent_webpage_url = agent_webpage_url

    def _build_agent_webpage_url(self, session_id: str) -> str:
        # Note: scenario removed - agent prompt is now hardcoded in ElevenLabs dashboard
        params = urlencode({"session_id": session_id})
        return f"{self._agent_webpage_url}?{params}"

    async def create_bot(
        self,
        *,
        meeting_url: str,
        session_id: str,
        bot_name: str = "Support Test Agent",
    ) -> Dict[str, Any]:
        agent_url = self._build_agent_webpage_url(session_id)
        return await recall_client.create_bot(
            cfg=self._cfg,
            meeting_url=meeting_url,
            bot_name=bot_name,
            agent_webpage_url=agent_url,
            timeout=30.0,
        )

    async def remove_bot_from_call(self, bot_id: str) -> bool:
        return await recall_client.remove_bot_from_call(cfg=self._cfg, bot_id=bot_id, timeout=30.0)

    async def get_bot_status(self, bot_id: str) -> Optional[Dict[str, Any]]:
        return await recall_client.get_bot_status(cfg=self._cfg, bot_id=bot_id, timeout=30.0)


from config import config  # imported late to avoid any init ordering surprises

recall_service = RecallService(
    api_key=config.recall_api_key,
    base_url=config.recall_base_url,
    agent_webpage_url=config.agent_webpage_url,
)

