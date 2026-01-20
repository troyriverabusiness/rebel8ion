# ABOUTME: Service for target selection (forwards selected company to Make.com webhook).

from __future__ import annotations

from api.v1.data_access.http_client import NetworkRequestError, NetworkTimeoutError, post_json


async def forward_target_company(*, webhook_url: str, company_name: str) -> None:
    """
    Forward a target company selection to Make.com webhook.

    Raises:
        NetworkTimeoutError, NetworkRequestError
        Exception: for non-2xx statuses (to keep route behavior consistent via raise_for_status-like semantics)
    """
    resp = await post_json(
        webhook_url,
        json_body={"company_name": company_name},
        timeout=30.0,
    )
    # This preserves the old behavior (and the shape of error messages)
    resp.raise_for_status()

