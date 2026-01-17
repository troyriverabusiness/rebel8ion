# ABOUTME: Services package containing business logic and external API integrations.
# ABOUTME: Exports session manager and Recall.ai service for use in API routes.

from services.recall_service import RecallService, recall_service
from services.session_manager import SessionManager, session_manager

__all__ = [
    "RecallService",
    "SessionManager",
    "recall_service",
    "session_manager",
]
