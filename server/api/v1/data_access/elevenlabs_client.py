# ABOUTME: ElevenLabs API client (outbound HTTP only).
# ABOUTME: Provides a single method to retrieve a conversation signed URL.

from __future__ import annotations

from typing import Optional

from api.v1.data_access.http_client import (
    NetworkRequestError,
    NetworkTimeoutError,
    get_json,
)


class ElevenLabsAPIError(Exception):
    """Raised when ElevenLabs responds with a non-200 or invalid payload."""

    def __init__(self, message: str, status_code: Optional[int] = None, response_body: Optional[str] = None):
        self.status_code = status_code
        self.response_body = response_body
        super().__init__(message)


async def get_conversation_signed_url(
    *,
    agent_id: str,
    api_key: str,
    timeout: float = 30.0,
) -> str:
    """
    Get signed URL for ElevenLabs conversation websocket.

    Raises:
        NetworkTimeoutError, NetworkRequestError
        ElevenLabsAPIError
    """
    resp = await get_json(
        "https://api.elevenlabs.io/v1/convai/conversation/get-signed-url",
        params={"agent_id": agent_id},
        headers={"xi-api-key": api_key},
        timeout=timeout,
    )

    if resp.status_code != 200:
        raise ElevenLabsAPIError(
            f"Failed to get signed URL from ElevenLabs: {resp.status_code}",
            status_code=resp.status_code,
            response_body=resp.text,
        )

    signed_url = None
    if isinstance(resp.json, dict):
        signed_url = resp.json.get("signed_url")

    if not signed_url or not isinstance(signed_url, str):
        raise ElevenLabsAPIError(
            "ElevenLabs response missing signed_url",
            status_code=resp.status_code,
            response_body=resp.text,
        )

    return signed_url

