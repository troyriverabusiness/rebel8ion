from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse
from typing import Any, Dict, Optional
import logging
import asyncio
import json
from collections import deque
from datetime import datetime

router = APIRouter()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Store webhook events to broadcast to connected clients
webhook_events = deque(maxlen=100)
event_subscribers = []

# In-memory storage for company OSINT data
# Structure: {company_name: {osint_data: {...}, timestamp: "...", last_updated: "..."}}
company_osint_data: Dict[str, Dict[str, Any]] = {}


@router.post("/webhook/make")
async def receive_make_webhook(request: Request):
    """
    Webhook endpoint to receive data from Make.com
    
    This endpoint accepts POST requests with JSON payloads from Make automation workflows.
    """
    try:
        # Get the JSON payload from the request
        payload: Dict[str, Any] = await request.json()
        
        # Log the received webhook data
        logger.info(f"Received webhook from Make: {payload}")
        
        # Handle Make.com's wrapped format: {"text": "{...escaped JSON...}"}
        if "text" in payload and isinstance(payload["text"], str):
            try:
                # Parse the nested JSON string
                unwrapped_payload = json.loads(payload["text"])
                logger.info(f"Unwrapped Make payload: {unwrapped_payload}")
                
                # Use the unwrapped payload
                final_payload = unwrapped_payload
            except json.JSONDecodeError:
                logger.warning("Could not parse 'text' field as JSON, using original payload")
                final_payload = payload
        else:
            # Use original payload if not wrapped
            final_payload = payload
        
        # Extract common fields if they exist
        event_type = final_payload.get("event_type")
        data = final_payload.get("data")
        timestamp = final_payload.get("timestamp")
        company_name = final_payload.get("company_name")
        
        logger.info(f"Event Type: {event_type}")
        logger.info(f"Data: {data}")
        logger.info(f"Timestamp: {timestamp}")
        logger.info(f"Company Name: {company_name}")
        
        # Store OSINT data in memory for the specific company
        if company_name:
            if company_name not in company_osint_data:
                company_osint_data[company_name] = {
                    "osint_data": {},
                    "created_at": datetime.utcnow().isoformat(),
                    "last_updated": datetime.utcnow().isoformat()
                }
            
            # Update the company's OSINT data
            company_osint_data[company_name]["osint_data"].update(final_payload)
            company_osint_data[company_name]["last_updated"] = datetime.utcnow().isoformat()
            
            logger.info(f"Stored OSINT data for company: {company_name}")
            logger.info(f"Total companies in storage: {len(company_osint_data)}")
        
        # Store the unwrapped event and notify subscribers
        webhook_events.append(final_payload)
        for queue in event_subscribers:
            await queue.put(final_payload)
        
        # Return a success response
        return {
            "status": "success",
            "message": "Webhook received successfully",
            "received_data": final_payload
        }
        
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Error processing webhook: {str(e)}"
        )


@router.post("/webhook/make/verify")
async def verify_make_webhook():
    """
    Verification endpoint for Make.com webhook setup.
    
    Make.com sometimes sends verification requests when setting up webhooks.
    """
    return {
        "status": "verified",
        "message": "Webhook endpoint is active and ready to receive data"
    }


@router.get("/webhook/status")
async def webhook_status():
    """Check webhook endpoint status."""
    return {
        "status": "active",
        "endpoint": "/api/v1/webhook/make",
        "methods": ["POST"],
        "description": "Ready to receive webhooks from Make.com"
    }


@router.get("/webhook/stream")
async def stream_webhook_events(request: Request):
    """
    Server-Sent Events (SSE) endpoint to stream webhook events to clients.
    """
    async def event_generator():
        # Create a queue for this client
        queue = asyncio.Queue()
        event_subscribers.append(queue)
        
        try:
            while True:
                # Check if client is still connected
                if await request.is_disconnected():
                    break
                
                # Wait for new events with a timeout
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=30.0)
                    # Send the event in SSE format
                    yield f"data: {json.dumps(event)}\n\n"
                except asyncio.TimeoutError:
                    # Send a keep-alive comment every 30 seconds
                    yield ": keep-alive\n\n"
                    
        finally:
            # Remove this client's queue when disconnected
            event_subscribers.remove(queue)
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@router.get("/osint/company/{company_name}")
async def get_company_osint_data(company_name: str):
    """
    Retrieve stored OSINT data for a specific company.
    
    Args:
        company_name: The name of the company to retrieve data for
        
    Returns:
        The stored OSINT data for the company, or 404 if not found
    """
    if company_name not in company_osint_data:
        raise HTTPException(
            status_code=404,
            detail=f"No OSINT data found for company: {company_name}"
        )
    
    return {
        "status": "success",
        "company_name": company_name,
        "data": company_osint_data[company_name]
    }


@router.get("/osint/companies")
async def list_companies_with_osint_data():
    """
    List all companies that have OSINT data stored.
    
    Returns:
        A list of company names and their last update timestamps
    """
    companies = [
        {
            "company_name": name,
            "created_at": data.get("created_at"),
            "last_updated": data.get("last_updated"),
            "has_data": bool(data.get("osint_data"))
        }
        for name, data in company_osint_data.items()
    ]
    
    return {
        "status": "success",
        "total_companies": len(companies),
        "companies": companies
    }


@router.delete("/osint/company/{company_name}")
async def delete_company_osint_data(company_name: str):
    """
    Delete stored OSINT data for a specific company.
    
    Args:
        company_name: The name of the company to delete data for
        
    Returns:
        Success message or 404 if not found
    """
    if company_name not in company_osint_data:
        raise HTTPException(
            status_code=404,
            detail=f"No OSINT data found for company: {company_name}"
        )
    
    del company_osint_data[company_name]
    logger.info(f"Deleted OSINT data for company: {company_name}")
    
    return {
        "status": "success",
        "message": f"OSINT data for company '{company_name}' has been deleted"
    }

