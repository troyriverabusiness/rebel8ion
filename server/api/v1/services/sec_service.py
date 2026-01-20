# ABOUTME: Service for security-related endpoints (e.g., company search proxy).

from __future__ import annotations

from typing import Any, List

from api.v1.data_access.clearbit_client import ClearbitAPIError, search_companies as clearbit_search_companies


async def search_companies(*, query: str) -> List[Any]:
    """
    Proxy company search via Clearbit.

    Raises:
        ClearbitAPIError
    """
    return await clearbit_search_companies(query=query, timeout=10.0)

