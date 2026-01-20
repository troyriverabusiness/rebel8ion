# ABOUTME: Make.com webhook client (outbound HTTP only).
# ABOUTME: Used by target selection and attack execution endpoints.

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Optional

from api.v1.data_access.http_client import NetworkRequestError, NetworkTimeoutError, post_json


@dataclass(frozen=True)
class MakePostResult:
    status_code: int
    text: str


async def post_webhook(
    *,
    webhook_url: str,
    payload: Any,
    timeout: float = 30.0,
) -> MakePostResult:
    """
    POST JSON payload to a Make.com webhook URL.

    Raises:
        NetworkTimeoutError, NetworkRequestError
    """
    resp = await post_json(webhook_url, json_body=payload, timeout=timeout)
    return MakePostResult(status_code=resp.status_code, text=resp.text)

