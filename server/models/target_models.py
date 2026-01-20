# ABOUTME: Pydantic models for target selection endpoints.

from __future__ import annotations

from pydantic import BaseModel


class TargetCompany(BaseModel):
    company_name: str

