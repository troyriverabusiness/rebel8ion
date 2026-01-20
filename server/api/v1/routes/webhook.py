from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse
from typing import Any, Dict
import logging
from api.v1.services import event_stream, webhook_service

router = APIRouter()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


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

        final_payload = await webhook_service.process_make_webhook(payload)
        
        # Extract common fields if they exist
        event_type = final_payload.get("event_type")
        data = final_payload.get("data")
        timestamp = final_payload.get("timestamp")
        
        # Try to get company name from different possible locations
        company_name = final_payload.get("company_name")
        if not company_name and "companyProfile" in final_payload:
            company_name = final_payload.get("companyProfile", {}).get("name")
        
        logger.info(f"Event Type: {event_type}")
        logger.info(f"Data: {data}")
        logger.info(f"Timestamp: {timestamp}")
        logger.info(f"Company Name: {company_name}")
        
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
    return StreamingResponse(
        event_stream.sse_event_generator(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )
