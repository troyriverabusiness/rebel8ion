# ABOUTME: Recall.ai API client for managing meeting bots.
# ABOUTME: Handles bot creation, removal from calls, and status checking.

import logging
from typing import Any, Dict, Optional
from urllib.parse import urlencode

import httpx

from config import config


# Configure logging
logger = logging.getLogger(__name__)


class RecallAPIError(Exception):
    """Raised when a Recall.ai API call fails."""

    def __init__(self, message: str, status_code: Optional[int] = None, response_body: Optional[str] = None):
        self.status_code = status_code
        self.response_body = response_body
        super().__init__(message)


class RecallService:
    """
    Client for interacting with the Recall.ai API.

    Handles authentication, bot creation, and bot lifecycle management.
    Uses async httpx client for non-blocking HTTP requests.
    """

    def __init__(self, api_key: str, base_url: str, agent_webpage_url: str) -> None:
        """
        Initialize the Recall.ai service.

        Args:
            api_key: The Recall.ai API key for authentication.
            base_url: The base URL for the Recall.ai API (region-specific).
            agent_webpage_url: The URL of the agent webpage to stream in meetings.
        """
        self._api_key = api_key
        self._base_url = base_url
        self._agent_webpage_url = agent_webpage_url

    def _get_headers(self) -> Dict[str, str]:
        """Get the headers for API requests including authentication."""
        return {
            "Authorization": f"Token {self._api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    def _build_agent_webpage_url(self, session_id: str) -> str:
        """
        Build the agent webpage URL with query parameters.

        Args:
            session_id: The session ID to pass to the agent.

        Returns:
            The complete URL with query parameters.
        """
        # Note: scenario removed - agent prompt is now hardcoded in ElevenLabs dashboard
        params = urlencode({"session_id": session_id})
        return f"{self._agent_webpage_url}?{params}"

    async def create_bot(
        self,
        meeting_url: str,
        session_id: str,
        bot_name: str = "Support Test Agent",
    ) -> Dict[str, Any]:
        """
        Create a new bot that joins a meeting with the agent webpage.

        Args:
            meeting_url: The Google Meet URL to join.
            session_id: The session ID for this agent session.
            bot_name: The display name for the bot in the meeting.

        Returns:
            A dict containing at minimum the 'id' of the created bot.

        Raises:
            RecallAPIError: If the API call fails.
        """
        agent_url = self._build_agent_webpage_url(session_id)

        payload = {
            "meeting_url": meeting_url,
            "bot_name": bot_name,
            "output_media": {
                "camera": {
                    "kind": "webpage",
                    "config": {
                        "url": agent_url,
                    },
                },
            },
        }

        logger.info(f"Creating Recall.ai bot for meeting: {meeting_url}")
        logger.debug(f"Bot payload: {payload}")

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self._base_url}/bot/",
                    headers=self._get_headers(),
                    json=payload,
                    timeout=30.0,
                )

                if response.status_code >= 400:
                    error_body = response.text
                    logger.error(f"Recall.ai API error: {response.status_code} - {error_body}")
                    raise RecallAPIError(
                        f"Failed to create bot: {response.status_code}",
                        status_code=response.status_code,
                        response_body=error_body,
                    )

                result = response.json()
                logger.info(f"Successfully created bot with ID: {result.get('id')}")
                return result

            except httpx.TimeoutException as e:
                logger.error(f"Timeout creating bot: {e}")
                raise RecallAPIError("Request to Recall.ai timed out") from e
            except httpx.RequestError as e:
                logger.error(f"Request error creating bot: {e}")
                raise RecallAPIError(f"Failed to connect to Recall.ai: {e}") from e

    async def remove_bot_from_call(self, bot_id: str) -> bool:
        """
        Remove a bot from an active call.

        This endpoint is used for bots that are already in a call or have started joining.
        For scheduled bots that haven't started joining, use delete_bot instead.

        Args:
            bot_id: The ID of the bot to remove.

        Returns:
            True if the bot was successfully removed.

        Raises:
            RecallAPIError: If the API call fails.
        """
        logger.info(f"Removing bot from call: {bot_id}")

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self._base_url}/bot/leave_call/create",
                    headers=self._get_headers(),
                    json={"bot_id": bot_id},
                    timeout=30.0,
                )

                if response.status_code >= 400:
                    error_body = response.text
                    logger.error(f"Recall.ai API error removing bot: {response.status_code} - {error_body}")
                    raise RecallAPIError(
                        f"Failed to remove bot from call: {response.status_code}",
                        status_code=response.status_code,
                        response_body=error_body,
                    )

                logger.info(f"Successfully removed bot {bot_id} from call")
                return True

            except httpx.TimeoutException as e:
                logger.error(f"Timeout removing bot from call: {e}")
                raise RecallAPIError("Request to Recall.ai timed out") from e
            except httpx.RequestError as e:
                logger.error(f"Request error removing bot from call: {e}")
                raise RecallAPIError(f"Failed to connect to Recall.ai: {e}") from e

    async def get_bot_status(self, bot_id: str) -> Optional[Dict[str, Any]]:
        """
        Get the current status of a bot.

        Args:
            bot_id: The ID of the bot to check.

        Returns:
            A dict containing the bot status, or None if not found.

        Raises:
            RecallAPIError: If the API call fails (except for 404).
        """
        logger.debug(f"Getting status for bot: {bot_id}")

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self._base_url}/bot/{bot_id}/",
                    headers=self._get_headers(),
                    timeout=30.0,
                )

                if response.status_code == 404:
                    logger.debug(f"Bot not found: {bot_id}")
                    return None

                if response.status_code >= 400:
                    error_body = response.text
                    logger.error(f"Recall.ai API error getting bot status: {response.status_code} - {error_body}")
                    raise RecallAPIError(
                        f"Failed to get bot status: {response.status_code}",
                        status_code=response.status_code,
                        response_body=error_body,
                    )

                return response.json()

            except httpx.TimeoutException as e:
                logger.error(f"Timeout getting bot status: {e}")
                raise RecallAPIError("Request to Recall.ai timed out") from e
            except httpx.RequestError as e:
                logger.error(f"Request error getting bot status: {e}")
                raise RecallAPIError(f"Failed to connect to Recall.ai: {e}") from e


# Module-level singleton instance
recall_service = RecallService(
    api_key=config.recall_api_key,
    base_url=config.recall_base_url,
    agent_webpage_url=config.agent_webpage_url,
)
