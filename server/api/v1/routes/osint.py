from fastapi import APIRouter, HTTPException
import logging
from api.v1.services import osint_store

router = APIRouter()

# Configure logging
logger = logging.getLogger(__name__)

@router.get("/osint/company/{company_name}")
async def get_company_osint_data(company_name: str):
    """
    Retrieve stored OSINT data for a specific company.
    
    Args:
        company_name: The name of the company to retrieve data for
        
    Returns:
        The stored OSINT data for the company, or 404 if not found
    """
    record = osint_store.get_company_record(company_name)
    if record:
        matched_name, data = record
        if matched_name != company_name:
            logger.info(f"Found partial match: '{company_name}' -> '{matched_name}'")
        return {
            "status": "success",
            "company_name": matched_name,
            "data": data,
        }

    raise HTTPException(
        status_code=404,
        detail=f"No OSINT data found for company: {company_name}"
    )


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
        for name, data in osint_store.company_osint_data.items()
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
    if company_name not in osint_store.company_osint_data:
        raise HTTPException(
            status_code=404,
            detail=f"No OSINT data found for company: {company_name}"
        )

    osint_store.delete_company_record_exact(company_name)
    
    return {
        "status": "success",
        "message": f"OSINT data for company '{company_name}' has been deleted"
    }
