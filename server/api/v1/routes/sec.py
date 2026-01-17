from fastapi import APIRouter, HTTPException
import httpx

router = APIRouter()

SEC_API_BASE_URL = "https://www.sec.gov"


@router.get("/sec/companies")
async def get_companies():
    """
    Proxy endpoint to fetch company tickers from SEC API.
    This avoids CORS issues when calling SEC API directly from the browser.
    """
    try:
        async with httpx.AsyncClient() as client:
            # SEC requires a User-Agent header
            headers = {
                "User-Agent": "Revel8 Application contact@example.com",
                "Accept": "application/json",
            }
            response = await client.get(
                f"{SEC_API_BASE_URL}/files/company_tickers.json",
                headers=headers,
                timeout=30.0,
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch companies from SEC API: {str(e)}",
        )
