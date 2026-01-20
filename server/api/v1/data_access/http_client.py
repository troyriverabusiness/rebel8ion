# ABOUTME: Shared httpx helpers for outbound network calls.
# ABOUTME: Provides consistent exception types for timeouts/request errors.

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Optional

import httpx


class NetworkTimeoutError(Exception):
    """Raised when an outbound request times out."""


class NetworkRequestError(Exception):
    """Raised when an outbound request fails to connect or send."""


@dataclass(frozen=True)
class JsonHttpResponse:
    """Small wrapper for HTTP response details."""

    status_code: int
    json: Any
    text: str
    headers: Dict[str, str]


async def get_json(
    url: str,
    *,
    headers: Optional[Dict[str, str]] = None,
    params: Optional[Dict[str, Any]] = None,
    timeout: float = 10.0,
) -> JsonHttpResponse:
    """
    Perform an HTTP GET and return parsed JSON.

    Raises:
        NetworkTimeoutError: on timeout.
        NetworkRequestError: on connection/request failures.
    """
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.get(url, headers=headers, params=params)
    except httpx.TimeoutException as e:
        raise NetworkTimeoutError(str(e)) from e
    except httpx.RequestError as e:
        raise NetworkRequestError(str(e)) from e

    text = resp.text
    try:
        data = resp.json()
    except Exception:
        data = None

    return JsonHttpResponse(
        status_code=resp.status_code,
        json=data,
        text=text,
        headers=dict(resp.headers),
    )


async def post_json(
    url: str,
    *,
    json_body: Any,
    headers: Optional[Dict[str, str]] = None,
    timeout: float = 10.0,
) -> httpx.Response:
    """
    Perform an HTTP POST with a JSON body.

    Returns:
        The raw httpx.Response (caller can inspect status/text/json).

    Raises:
        NetworkTimeoutError: on timeout.
        NetworkRequestError: on connection/request failures.
    """
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            return await client.post(url, headers=headers, json=json_body)
    except httpx.TimeoutException as e:
        raise NetworkTimeoutError(str(e)) from e
    except httpx.RequestError as e:
        raise NetworkRequestError(str(e)) from e

