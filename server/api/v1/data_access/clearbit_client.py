# ABOUTME: Clearbit API client (outbound HTTP only).
# ABOUTME: Used by the /companies/search proxy endpoint.

from __future__ import annotations

from typing import Any, List

import httpx


CLEARBIT_API_URL = "https://autocomplete.clearbit.com/v1/companies/suggest"


class ClearbitAPIError(Exception):
    """Raised when Clearbit request fails."""


async def search_companies(*, query: str, timeout: float = 10.0) -> List[Any]:
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.get(CLEARBIT_API_URL, params={"query": query})
            resp.raise_for_status()
            data = resp.json()
            return data if isinstance(data, list) else []
    except httpx.HTTPError as e:
        raise ClearbitAPIError(str(e)) from e

