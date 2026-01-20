# ABOUTME: Attack orchestration service (bulk + individual webhook dispatch).

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from api.v1.data_access.http_client import NetworkRequestError, NetworkTimeoutError
from api.v1.data_access.make_client import post_webhook
from api.v1.services import osint_store


logger = logging.getLogger(__name__)


class CompanyOSINTNotFoundError(Exception):
    pass


class NoEmployeesFoundError(Exception):
    pass


def _extract_employees(osint_record: Dict[str, Any]) -> List[Dict[str, Any]]:
    osint_data = osint_record.get("osint_data", {}) if isinstance(osint_record, dict) else {}
    if not isinstance(osint_data, dict):
        return []

    employees = osint_data.get("keyPersonnel") or osint_data.get("data", {}).get("keyPersonnel") or []
    return employees if isinstance(employees, list) else []


async def _send_employee_webhook(
    *,
    webhook_url: str,
    employee: Dict[str, Any],
    company_name: str,
) -> Dict[str, Any]:
    payload = {
        "company_name": company_name,
        "employee": employee,
        "timestamp": datetime.utcnow().isoformat(),
        "attack_type": "multi-channel",
    }

    try:
        result = await post_webhook(webhook_url=webhook_url, payload=payload, timeout=10.0)

        if result.status_code in [200, 201, 202]:
            logger.info(f"Webhook sent successfully for employee: {employee.get('name')}")
            return {
                "employee_name": employee.get("name"),
                "status": "success",
                "status_code": result.status_code,
                "message": "Webhook delivered successfully",
            }

        logger.warning(
            f"Webhook failed for employee: {employee.get('name')} - Status: {result.status_code}"
        )
        return {
            "employee_name": employee.get("name"),
            "status": "failed",
            "status_code": result.status_code,
            "message": f"Webhook returned status {result.status_code}",
        }
    except NetworkTimeoutError:
        logger.error(f"Webhook timeout for employee: {employee.get('name')}")
        return {
            "employee_name": employee.get("name"),
            "status": "failed",
            "error": "timeout",
            "message": "Webhook request timed out",
        }
    except Exception as e:
        logger.error(f"Webhook error for employee: {employee.get('name')} - Error: {str(e)}")
        return {
            "employee_name": employee.get("name"),
            "status": "failed",
            "error": str(e),
            "message": f"Webhook request failed: {str(e)}",
        }


async def execute_attack(
    *,
    requested_company_name: str,
    webhook_url: str,
) -> Tuple[str, List[Dict[str, Any]], int, int, float]:
    """
    Execute bulk attack against a company's stored OSINT employees.

    Returns:
        (matched_company_name, results, successful_count, failed_count, execution_time_seconds)
    Raises:
        CompanyOSINTNotFoundError: if company not found
        NoEmployeesFoundError: if no employees
    """
    start_time = datetime.utcnow()
    logger.info(f"[ATTACK] Initiating attack execution for company: {requested_company_name}")

    record = osint_store.get_company_record(requested_company_name)
    if not record:
        raise CompanyOSINTNotFoundError(
            f"No OSINT data found for company: {requested_company_name}. Please complete reconnaissance first."
        )

    matched_company_name, company_data = record
    if matched_company_name != requested_company_name:
        logger.info(f"[ATTACK] Found partial match: '{requested_company_name}' -> '{matched_company_name}'")

    employees = _extract_employees(company_data)
    if not employees:
        raise NoEmployeesFoundError(f"No employees found in OSINT data for company: {matched_company_name}")

    logger.info(f"[ATTACK] Found {len(employees)} employees to target")

    results: List[Dict[str, Any]] = []
    successful_count = 0
    failed_count = 0

    for employee in employees:
        logger.info(
            f"[ATTACK] Targeting employee: {employee.get('name')} ({employee.get('role')})"
        )
        result = await _send_employee_webhook(
            webhook_url=webhook_url,
            employee=employee,
            company_name=matched_company_name,
        )
        results.append(result)

        if result.get("status") == "success":
            successful_count += 1
        else:
            failed_count += 1

    end_time = datetime.utcnow()
    execution_time = (end_time - start_time).total_seconds()

    logger.info(f"[ATTACK] Attack execution complete for {matched_company_name}")
    logger.info(
        f"[ATTACK] Total: {len(employees)}, Successful: {successful_count}, Failed: {failed_count}"
    )
    logger.info(f"[ATTACK] Execution time: {execution_time:.2f}s")

    return matched_company_name, results, successful_count, failed_count, execution_time


async def execute_individual_attack(
    *,
    webhook_url: str,
    name: str,
    company_position: str,
    email: Optional[str],
    phone: Optional[str],
) -> Tuple[bool, str]:
    """
    Returns:
        (webhook_sent, message)
    """
    logger.info(f"[INDIVIDUAL ATTACK] Initiating attack on: {name} ({company_position})")

    # Default contact values for individual attacks
    final_email = email or "hackathon@revel8.ai"
    phones = [phone] if phone else ["+49-171 5588972", "+49 1577 8885845", "+49 1578 3022220"]

    payload = {
        "name": name,
        "company_position": company_position,
        "email": final_email,
        "phones": phones,
        "timestamp": datetime.utcnow().isoformat(),
        "attack_type": "individual",
    }

    logger.info(f"[INDIVIDUAL ATTACK] Payload: {payload}")

    try:
        result = await post_webhook(webhook_url=webhook_url, payload=payload, timeout=10.0)
        if result.status_code in [200, 201, 202]:
            logger.info(f"[INDIVIDUAL ATTACK] Webhook sent successfully for: {name}")
            return True, f"Individual attack executed successfully against {name}"

        logger.warning(f"[INDIVIDUAL ATTACK] Webhook failed for: {name} - Status: {result.status_code}")
        return False, f"Webhook returned status {result.status_code}"
    except NetworkTimeoutError:
        logger.error(f"[INDIVIDUAL ATTACK] Webhook timeout for: {name}")
        return False, "Webhook request timed out"
    except Exception as e:
        logger.error(f"[INDIVIDUAL ATTACK] Webhook error for: {name} - Error: {str(e)}")
        return False, f"Webhook request failed: {str(e)}"

