from fastapi import APIRouter, HTTPException
from api.v1.data_access.http_client import NetworkRequestError, NetworkTimeoutError
from api.v1.services import target_service
from models.target_models import TargetCompany

router = APIRouter()


WEBHOOK_URL = "https://hook.eu2.make.com/j0avgw7p2ne1y2tz9vqdm6i67vph67xw"

@router.post("/target/select")
async def select_target(target: TargetCompany):
    """
    Endpoint to handle target company selection.
    Forwards the company name to the Make.com webhook.
    """
    try:
        await target_service.forward_target_company(
            webhook_url=WEBHOOK_URL,
            company_name=target.company_name,
        )
        return {
            "success": True,
            "message": f"Target company '{target.company_name}' successfully sent to webhook",
        }
    except (NetworkTimeoutError, NetworkRequestError, Exception) as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send company to webhook: {str(e)}",
        )
