from fastapi import APIRouter, HTTPException
from typing import Any, Dict
import logging
from datetime import datetime

router = APIRouter()

# Configure logging
logger = logging.getLogger(__name__)

# In-memory storage for company OSINT data
# Structure: {company_name: {osint_data: {...}, created_at: "...", last_updated: "..."}}
company_osint_data: Dict[str, Dict[str, Any]] = {}


def store_company_osint(company_name: str, osint_data: Dict[str, Any]) -> None:
    """
    Store or update OSINT data for a company.
    
    Args:
        company_name: The name of the company
        osint_data: The OSINT data to store
    """
    if company_name not in company_osint_data:
        company_osint_data[company_name] = {
            "osint_data": {},
            "created_at": datetime.utcnow().isoformat(),
            "last_updated": datetime.utcnow().isoformat()
        }
    
    # Update the company's OSINT data
    company_osint_data[company_name]["osint_data"].update(osint_data)
    company_osint_data[company_name]["last_updated"] = datetime.utcnow().isoformat()
    
    logger.info(f"Stored OSINT data for company: {company_name}")
    logger.info(f"Total companies in storage: {len(company_osint_data)}")


@router.get("/osint/company/{company_name}")
async def get_company_osint_data(company_name: str):
    """
    Retrieve stored OSINT data for a specific company.
    
    Args:
        company_name: The name of the company to retrieve data for
        
    Returns:
        The stored OSINT data for the company, or 404 if not found
    """
    # Try exact match first
    if company_name in company_osint_data:
        return {
            "status": "success",
            "company_name": company_name,
            "data": company_osint_data[company_name]
        }
    
    # Try case-insensitive partial match
    company_name_lower = company_name.lower()
    for stored_name, stored_data in company_osint_data.items():
        if (company_name_lower in stored_name.lower() or 
            stored_name.lower().startswith(company_name_lower)):
            logger.info(f"Found partial match: '{company_name}' -> '{stored_name}'")
            return {
                "status": "success",
                "company_name": stored_name,
                "data": stored_data
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
        for name, data in company_osint_data.items()
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
    if company_name not in company_osint_data:
        raise HTTPException(
            status_code=404,
            detail=f"No OSINT data found for company: {company_name}"
        )
    
    del company_osint_data[company_name]
    logger.info(f"Deleted OSINT data for company: {company_name}")
    
    return {
        "status": "success",
        "message": f"OSINT data for company '{company_name}' has been deleted"
    }
