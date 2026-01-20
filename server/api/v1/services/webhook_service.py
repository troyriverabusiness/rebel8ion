# ABOUTME: Webhook ingestion logic (unwrapping Make.com payloads, storing OSINT, broadcasting SSE).

from __future__ import annotations

import json
import logging
from typing import Any, Dict, Optional

from api.v1.services import event_stream, osint_store


logger = logging.getLogger(__name__)


def _extract_company_name(payload: Dict[str, Any]) -> Optional[str]:
    company_name = payload.get("company_name")
    if not company_name and "companyProfile" in payload:
        maybe_profile = payload.get("companyProfile") or {}
        if isinstance(maybe_profile, dict):
            company_name = maybe_profile.get("name")
    return company_name if isinstance(company_name, str) and company_name else None


def unwrap_make_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Handle Make.com's wrapped format: {"text": "{...escaped JSON...}"}.
    """
    if "text" in payload and isinstance(payload["text"], str):
        try:
            unwrapped = json.loads(payload["text"])
            if isinstance(unwrapped, dict):
                logger.info(f"Unwrapped Make payload: {unwrapped}")
                return unwrapped
        except json.JSONDecodeError:
            logger.warning("Could not parse 'text' field as JSON, using original payload")
    return payload


async def process_make_webhook(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Process a Make.com webhook payload and broadcast it.

    Returns:
        The final (possibly unwrapped) payload.
    """
    final_payload = unwrap_make_payload(payload)

    company_name = _extract_company_name(final_payload)
    if company_name:
        osint_store.store_company_osint(company_name, final_payload)

    await event_stream.broadcast_event(final_payload)
    return final_payload

