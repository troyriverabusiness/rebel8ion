# ABOUTME: Pydantic models for attack-related endpoints.

from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel


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

