# ABOUTME: Server-Sent Events (SSE) event stream + broadcaster.
# ABOUTME: Used by webhook ingestion and agent lifecycle to notify connected clients.

from __future__ import annotations

import asyncio
import json
import logging
from collections import deque
from typing import Any, AsyncGenerator, Deque, Dict, List

from fastapi import Request


logger = logging.getLogger(__name__)

# Store recent events (used implicitly by connected clients / debugging)
webhook_events: Deque[Dict[str, Any]] = deque(maxlen=100)
event_subscribers: List[asyncio.Queue] = []


async def broadcast_event(event_data: Dict[str, Any]) -> None:
    """
    Broadcast an event to all connected SSE clients.

    Args:
        event_data: JSON-serializable event dict.
    """
    logger.info(f"Broadcasting event: {event_data.get('event_type', 'unknown')}")
    webhook_events.append(event_data)
    # Iterate over a snapshot to avoid issues if subscribers mutate during broadcast
    for queue in list(event_subscribers):
        await queue.put(event_data)


async def sse_event_generator(request: Request) -> AsyncGenerator[str, None]:
    """
    Async generator yielding SSE-formatted events for a single client.
    """
    queue: asyncio.Queue = asyncio.Queue()
    event_subscribers.append(queue)

    try:
        while True:
            if await request.is_disconnected():
                break

            try:
                event = await asyncio.wait_for(queue.get(), timeout=30.0)
                yield f"data: {json.dumps(event)}\n\n"
            except asyncio.TimeoutError:
                yield ": keep-alive\n\n"
    finally:
        # Remove this client's queue when disconnected
        if queue in event_subscribers:
            event_subscribers.remove(queue)

