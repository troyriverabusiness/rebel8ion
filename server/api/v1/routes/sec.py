from fastapi import APIRouter, HTTPException, Query
import httpx

router = APIRouter()

SEC_API_BASE_URL = "https://www.sec.gov"
CLEARBIT_API_URL = "https://autocomplete.clearbit.com/v1/companies/suggest"


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


@router.get("/companies/search")
async def search_companies(query: str = Query(..., min_length=1)):
    """
    Proxy endpoint to search companies using Clearbit API.
    This avoids CORS issues when calling Clearbit API directly from the browser.
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{CLEARBIT_API_URL}?query={query}",
                timeout=10.0,
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to search companies: {str(e)}",
        )
