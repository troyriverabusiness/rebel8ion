# ABOUTME: In-memory store for company OSINT data.
# ABOUTME: Shared across OSINT routes, webhook ingestion, and attack execution.

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, Dict, Optional, Tuple


logger = logging.getLogger(__name__)

# In-memory storage for company OSINT data
# Structure: {company_name: {osint_data: {...}, created_at: "...", last_updated: "..."}}
company_osint_data: Dict[str, Dict[str, Any]] = {}


def store_company_osint(company_name: str, osint_data: Dict[str, Any]) -> None:
    if company_name not in company_osint_data:
        company_osint_data[company_name] = {
            "osint_data": {},
            "created_at": datetime.utcnow().isoformat(),
            "last_updated": datetime.utcnow().isoformat(),
        }

    company_osint_data[company_name]["osint_data"].update(osint_data)
    company_osint_data[company_name]["last_updated"] = datetime.utcnow().isoformat()

    logger.info(f"Stored OSINT data for company: {company_name}")
    logger.info(f"Total companies in storage: {len(company_osint_data)}")


def find_company_name(company_name: str) -> Optional[str]:
    if company_name in company_osint_data:
        return company_name

    company_name_lower = company_name.lower()
    for stored_name in company_osint_data.keys():
        if company_name_lower in stored_name.lower() or stored_name.lower().startswith(company_name_lower):
            return stored_name

    return None


def get_company_record(company_name: str) -> Optional[Tuple[str, Dict[str, Any]]]:
    matched = find_company_name(company_name)
    if not matched:
        return None
    return matched, company_osint_data[matched]


def delete_company_record(company_name: str) -> bool:
    matched = find_company_name(company_name)
    if not matched:
        return False
    del company_osint_data[matched]
    logger.info(f"Deleted OSINT data for company: {matched}")
    return True


def delete_company_record_exact(company_name: str) -> bool:
    """
    Delete a company record by exact key match.
    (Preserves legacy behavior of the delete endpoint.)
    """
    if company_name not in company_osint_data:
        return False
    del company_osint_data[company_name]
    logger.info(f"Deleted OSINT data for company: {company_name}")
    return True

