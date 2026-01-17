from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx

router = APIRouter()


WEBHOOK_URL = "https://hook.eu2.make.com/j0avgw7p2ne1y2tz9vqdm6i67vph67xw"


class TargetCompany(BaseModel):
    company_name: str


@router.post("/target/select")
async def select_target(target: TargetCompany):
    """
    Endpoint to handle target company selection.
    Forwards the company name to the Make.com webhook.
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                WEBHOOK_URL,
                json={"company_name": target.company_name},
                timeout=30.0,
            )
            response.raise_for_status()
            return {
                "success": True,
                "message": f"Target company '{target.company_name}' successfully sent to webhook",
            }
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send company to webhook: {str(e)}",
        )
