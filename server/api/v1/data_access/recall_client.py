# ABOUTME: Recall.ai API client (outbound HTTP only).
# ABOUTME: Handles bot creation, leaving calls, and status checks.

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any, Dict, Optional

import httpx


logger = logging.getLogger(__name__)


class RecallAPIError(Exception):
    """Raised when a Recall.ai API call fails."""

    def __init__(self, message: str, status_code: Optional[int] = None, response_body: Optional[str] = None):
        self.status_code = status_code
        self.response_body = response_body
        super().__init__(message)


@dataclass(frozen=True)
class RecallClientConfig:
    api_key: str
    base_url: str


def _headers(api_key: str) -> Dict[str, str]:
    return {
        "Authorization": f"Token {api_key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }


async def create_bot(
    *,
    cfg: RecallClientConfig,
    meeting_url: str,
    bot_name: str,
    agent_webpage_url: str,
    timeout: float = 30.0,
) -> Dict[str, Any]:
    payload = {
        "meeting_url": meeting_url,
        "bot_name": bot_name,
        "output_media": {
            "camera": {
                "kind": "webpage",
                "config": {"url": agent_webpage_url},
            },
        },
    }

    logger.info(f"Creating Recall.ai bot for meeting: {meeting_url}")
    logger.debug(f"Bot payload: {payload}")

    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            resp = await client.post(
                f"{cfg.base_url}/bot/",
                headers=_headers(cfg.api_key),
                json=payload,
            )
        except httpx.TimeoutException as e:
            raise RecallAPIError("Request to Recall.ai timed out") from e
        except httpx.RequestError as e:
            raise RecallAPIError(f"Failed to connect to Recall.ai: {e}") from e

    if resp.status_code >= 400:
        error_body = resp.text
        logger.error(f"Recall.ai API error: {resp.status_code} - {error_body}")
        raise RecallAPIError(
            f"Failed to create bot: {resp.status_code}",
            status_code=resp.status_code,
            response_body=error_body,
        )

    return resp.json()


async def remove_bot_from_call(*, cfg: RecallClientConfig, bot_id: str, timeout: float = 30.0) -> bool:
    logger.info(f"Removing bot from call: {bot_id}")

    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            resp = await client.post(
                f"{cfg.base_url}/bot/leave_call/create",
                headers=_headers(cfg.api_key),
                json={"bot_id": bot_id},
            )
        except httpx.TimeoutException as e:
            raise RecallAPIError("Request to Recall.ai timed out") from e
        except httpx.RequestError as e:
            raise RecallAPIError(f"Failed to connect to Recall.ai: {e}") from e

    if resp.status_code >= 400:
        error_body = resp.text
        logger.error(f"Recall.ai API error removing bot: {resp.status_code} - {error_body}")
        raise RecallAPIError(
            f"Failed to remove bot from call: {resp.status_code}",
            status_code=resp.status_code,
            response_body=error_body,
        )

    logger.info(f"Successfully removed bot {bot_id} from call")
    return True


async def get_bot_status(
    *,
    cfg: RecallClientConfig,
    bot_id: str,
    timeout: float = 30.0,
) -> Optional[Dict[str, Any]]:
    logger.debug(f"Getting status for bot: {bot_id}")

    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            resp = await client.get(
                f"{cfg.base_url}/bot/{bot_id}/",
                headers=_headers(cfg.api_key),
            )
        except httpx.TimeoutException as e:
            raise RecallAPIError("Request to Recall.ai timed out") from e
        except httpx.RequestError as e:
            raise RecallAPIError(f"Failed to connect to Recall.ai: {e}") from e

    if resp.status_code == 404:
        logger.debug(f"Bot not found: {bot_id}")
        return None

    if resp.status_code >= 400:
        error_body = resp.text
        logger.error(f"Recall.ai API error getting bot status: {resp.status_code} - {error_body}")
        raise RecallAPIError(
            f"Failed to get bot status: {resp.status_code}",
            status_code=resp.status_code,
            response_body=error_body,
        )

    return resp.json()

