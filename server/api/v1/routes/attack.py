from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
import logging
import httpx
from datetime import datetime

router = APIRouter()

# Configure logging
logger = logging.getLogger(__name__)

# TODO: Configure webhook URL
WEBHOOK_URL = "https://hook.eu2.make.com/in3dmghaqii1sg7tqke23ok2cqptd8n5" 



class AttackRequest(BaseModel):
    """Request model for executing an attack"""
    company_name: str


class AttackResponse(BaseModel):
    """Response model for attack execution"""
    status: str
    company_name: str
    total_employees: int
    successful_webhooks: int
    failed_webhooks: int
    execution_time: str
    details: List[Dict[str, Any]]


class IndividualAttackRequest(BaseModel):
    """Request model for executing an individual attack on a specific employee"""
    name: str
    company_position: str
    email: Optional[str] = None
    phone: Optional[str] = None


class IndividualAttackResponse(BaseModel):
    """Response model for individual attack execution"""
    status: str
    target_name: str
    webhook_sent: bool
    message: str


async def send_employee_webhook(employee: Dict[str, Any], company_name: str) -> Dict[str, Any]:
    """
    Send a POST request to the webhook for a single employee.
    
    Args:
        employee: Employee data dictionary
        company_name: Name of the target company
        
    Returns:
        Dictionary containing success status and details
    """
    payload = {
        "company_name": company_name,
        "employee": employee,
        "timestamp": datetime.utcnow().isoformat(),
        "attack_type": "multi-channel"
    }
    
    try:
        # TODO: Replace WEBHOOK_URL with actual webhook endpoint
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(WEBHOOK_URL, json=payload)
            
            if response.status_code in [200, 201, 202]:
                logger.info(f"Webhook sent successfully for employee: {employee.get('name')}")
                return {
                    "employee_name": employee.get("name"),
                    "status": "success",
                    "status_code": response.status_code,
                    "message": "Webhook delivered successfully"
                }
            else:
                logger.warning(f"Webhook failed for employee: {employee.get('name')} - Status: {response.status_code}")
                return {
                    "employee_name": employee.get("name"),
                    "status": "failed",
                    "status_code": response.status_code,
                    "message": f"Webhook returned status {response.status_code}"
                }
    except httpx.TimeoutException:
        logger.error(f"Webhook timeout for employee: {employee.get('name')}")
        return {
            "employee_name": employee.get("name"),
            "status": "failed",
            "error": "timeout",
            "message": "Webhook request timed out"
        }
    except Exception as e:
        logger.error(f"Webhook error for employee: {employee.get('name')} - Error: {str(e)}")
        return {
            "employee_name": employee.get("name"),
            "status": "failed",
            "error": str(e),
            "message": f"Webhook request failed: {str(e)}"
        }


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
    company_name = request.company_name
    start_time = datetime.utcnow()
    
    logger.info(f"[ATTACK] Initiating attack execution for company: {company_name}")
    
    # Import here to avoid circular dependency
    from .osint import company_osint_data
    
    # Check if company has OSINT data
    if company_name not in company_osint_data:
        # Try case-insensitive match
        company_name_lower = company_name.lower()
        found = False
        for stored_name in company_osint_data.keys():
            if (company_name_lower in stored_name.lower() or 
                stored_name.lower().startswith(company_name_lower)):
                company_name = stored_name
                found = True
                logger.info(f"[ATTACK] Found partial match: '{request.company_name}' -> '{company_name}'")
                break
        
        if not found:
            raise HTTPException(
                status_code=404,
                detail=f"No OSINT data found for company: {company_name}. Please complete reconnaissance first."
            )
    
    # Get company data
    company_data = company_osint_data[company_name]
    osint_data = company_data.get("osint_data", {})
    
    # Extract employee list from OSINT data
    # Try multiple possible locations for keyPersonnel
    employees = (
        osint_data.get("keyPersonnel") or 
        osint_data.get("data", {}).get("keyPersonnel") or 
        []
    )
    
    if not employees:
        raise HTTPException(
            status_code=400,
            detail=f"No employees found in OSINT data for company: {company_name}"
        )
    
    logger.info(f"[ATTACK] Found {len(employees)} employees to target")
    
    # Execute attack by sending webhook for each employee
    results = []
    successful_count = 0
    failed_count = 0
    
    for employee in employees:
        logger.info(f"[ATTACK] Targeting employee: {employee.get('name')} ({employee.get('role')})")
        result = await send_employee_webhook(employee, company_name)
        results.append(result)
        
        if result.get("status") == "success":
            successful_count += 1
        else:
            failed_count += 1
    
    end_time = datetime.utcnow()
    execution_time = (end_time - start_time).total_seconds()
    
    logger.info(f"[ATTACK] Attack execution complete for {company_name}")
    logger.info(f"[ATTACK] Total: {len(employees)}, Successful: {successful_count}, Failed: {failed_count}")
    logger.info(f"[ATTACK] Execution time: {execution_time:.2f}s")
    
    return AttackResponse(
        status="completed",
        company_name=company_name,
        total_employees=len(employees),
        successful_webhooks=successful_count,
        failed_webhooks=failed_count,
        execution_time=f"{execution_time:.2f}s",
        details=results
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
    logger.info(f"[INDIVIDUAL ATTACK] Initiating attack on: {request.name} ({request.company_position})")
    
    # TODO: Replace these default values with actual defaults
    email = request.email or "TODO_DEFAULT_EMAIL@example.com"  # TODO: Replace with actual default email
    phone = request.phone or "+1-000-000-0000"  # TODO: Replace with actual default phone number
    
    # Build payload for the webhook
    payload = {
        "name": request.name,
        "company_position": request.company_position,
        "email": email,
        "phone": phone,
        "timestamp": datetime.utcnow().isoformat(),
        "attack_type": "individual"
    }
    
    logger.info(f"[INDIVIDUAL ATTACK] Payload: {payload}")
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(WEBHOOK_URL, json=payload)
            
            if response.status_code in [200, 201, 202]:
                logger.info(f"[INDIVIDUAL ATTACK] Webhook sent successfully for: {request.name}")
                return IndividualAttackResponse(
                    status="success",
                    target_name=request.name,
                    webhook_sent=True,
                    message=f"Individual attack executed successfully against {request.name}"
                )
            else:
                logger.warning(f"[INDIVIDUAL ATTACK] Webhook failed for: {request.name} - Status: {response.status_code}")
                return IndividualAttackResponse(
                    status="failed",
                    target_name=request.name,
                    webhook_sent=False,
                    message=f"Webhook returned status {response.status_code}"
                )
    except httpx.TimeoutException:
        logger.error(f"[INDIVIDUAL ATTACK] Webhook timeout for: {request.name}")
        return IndividualAttackResponse(
            status="failed",
            target_name=request.name,
            webhook_sent=False,
            message="Webhook request timed out"
        )
    except Exception as e:
        logger.error(f"[INDIVIDUAL ATTACK] Webhook error for: {request.name} - Error: {str(e)}")
        return IndividualAttackResponse(
            status="failed",
            target_name=request.name,
            webhook_sent=False,
            message=f"Webhook request failed: {str(e)}"
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
