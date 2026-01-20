from fastapi import APIRouter, HTTPException, Query
from api.v1.data_access.clearbit_client import ClearbitAPIError
from api.v1.services import sec_service

router = APIRouter()


@router.get("/companies/search")
async def search_companies(query: str = Query(..., min_length=1)):
    """
    Proxy endpoint to search companies using Clearbit API.
    This avoids CORS issues when calling Clearbit API directly from the browser.
    """
    try:
        return await sec_service.search_companies(query=query)
    except ClearbitAPIError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to search companies: {str(e)}",
        )
