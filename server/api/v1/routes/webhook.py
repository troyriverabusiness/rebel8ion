from fastapi import APIRouter, Request, HTTPException
from typing import Any, Dict
import logging

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
        
        # Process the webhook data here
        # You can add your custom logic to handle the data
        
        # Example: Extract common fields if they exist
        event_type = payload.get("event_type")
        data = payload.get("data")
        timestamp = payload.get("timestamp")
        
        logger.info(f"Event Type: {event_type}")
        logger.info(f"Data: {data}")
        logger.info(f"Timestamp: {timestamp}")
        
        # Return a success response
        return {
            "status": "success",
            "message": "Webhook received successfully",
            "received_data": payload
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
