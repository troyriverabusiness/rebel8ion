from fastapi import APIRouter, HTTPException
import logging
from models.attack_models import (
    AttackRequest,
    AttackResponse,
    IndividualAttackRequest,
    IndividualAttackResponse,
)
from api.v1.services import attack_service

router = APIRouter()

# Configure logging
logger = logging.getLogger(__name__)

# TODO: Configure webhook URL
WEBHOOK_URL = "https://hook.eu2.make.com/in3dmghaqii1sg7tqke23ok2cqptd8n5" 


@router.post("/attack/execute", response_model=AttackResponse)
async def execute_attack(request: AttackRequest):
    """
    Execute a multi-channel attack against a target company.
    
    This endpoint:
    1. Retrieves the company's OSINT data
    2. Iterates through each employee
    3. Sends a POST request to the configured webhook for each employee
    
    Args:
        request: AttackRequest containing the company name
        
    Returns:
        AttackResponse with execution details and results
    """
    try:
        (
            company_name,
            results,
            successful_count,
            failed_count,
            execution_time,
        ) = await attack_service.execute_attack(
            requested_company_name=request.company_name,
            webhook_url=WEBHOOK_URL,
        )
    except attack_service.CompanyOSINTNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except attack_service.NoEmployeesFoundError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return AttackResponse(
        status="completed",
        company_name=company_name,
        total_employees=len(results),
        successful_webhooks=successful_count,
        failed_webhooks=failed_count,
        execution_time=f"{execution_time:.2f}s",
        details=results,
    )


@router.post("/attack/individual", response_model=IndividualAttackResponse)
async def execute_individual_attack(request: IndividualAttackRequest):
    """
    Execute an individual attack against a specific employee.
    
    This endpoint:
    1. Takes employee details (name, position, optional email/phone)
    2. Applies default values if email/phone not provided
    3. Forwards the payload to the configured webhook URL
    
    Args:
        request: IndividualAttackRequest containing employee details
        
    Returns:
        IndividualAttackResponse with execution result
    """
    webhook_sent, message = await attack_service.execute_individual_attack(
        webhook_url=WEBHOOK_URL,
        name=request.name,
        company_position=request.company_position,
        email=request.email,
        phone=request.phone,
    )

    return IndividualAttackResponse(
        status="success" if webhook_sent else "failed",
        target_name=request.name,
        webhook_sent=webhook_sent,
        message=message,
    )


@router.get("/attack/webhook-config")
async def get_webhook_config():
    """
    Get the current webhook configuration.
    
    Returns:
        Current webhook URL configuration
    """
    return {
        "webhook_url": WEBHOOK_URL,
        "individual_webhook_url": WEBHOOK_URL,
        "status": "configured" if WEBHOOK_URL != "https://example.com/webhook" else "not_configured",
        "individual_status": "configured" if WEBHOOK_URL != "https://example.com/individual-webhook" else "not_configured"
    }
