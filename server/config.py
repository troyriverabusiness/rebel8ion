# ABOUTME: Centralized configuration module for environment variables.
# ABOUTME: Loads settings from .env file and provides typed access to config values.

import os
from dataclasses import dataclass
from typing import Optional

from dotenv import load_dotenv


# Load environment variables from .env file
load_dotenv()


class ConfigurationError(Exception):
    """Raised when a required configuration value is missing."""
    pass


@dataclass(frozen=True)
class Config:
    """
    Application configuration loaded from environment variables.

    All required fields are validated on instantiation.
    Using frozen=True ensures immutability after creation.
    """

    # Recall.ai settings
    recall_api_key: str
    recall_region: str
    recall_base_url: str

    # ElevenLabs settings
    elevenlabs_api_key: str
    elevenlabs_agent_id: str

    # Agent webpage URL (served by the client on /agent route)
    agent_webpage_url: str

    @classmethod
    def from_env(cls) -> "Config":
        """
        Create a Config instance from environment variables.

        Raises:
            ConfigurationError: If a required environment variable is missing.
        """
        recall_api_key = os.getenv("RECALL_API_KEY")
        if not recall_api_key:
            raise ConfigurationError("RECALL_API_KEY environment variable is required")

        recall_region = os.getenv("RECALL_REGION", "us-west-2")
        recall_base_url = f"https://{recall_region}.recall.ai/api/v1"

        elevenlabs_api_key = os.getenv("ELEVENLABS_API_KEY")
        if not elevenlabs_api_key:
            raise ConfigurationError("ELEVENLABS_API_KEY environment variable is required")

        elevenlabs_agent_id = os.getenv("ELEVENLABS_AGENT_ID")
        if not elevenlabs_agent_id:
            raise ConfigurationError("ELEVENLABS_AGENT_ID environment variable is required")

        agent_webpage_url = os.getenv("AGENT_WEBPAGE_URL", "http://localhost:5173/agent")

        return cls(
            recall_api_key=recall_api_key,
            recall_region=recall_region,
            recall_base_url=recall_base_url,
            elevenlabs_api_key=elevenlabs_api_key,
            elevenlabs_agent_id=elevenlabs_agent_id,
            agent_webpage_url=agent_webpage_url,
        )


def get_config() -> Config:
    """
    Get the application configuration.

    Uses a module-level singleton pattern to avoid reloading config on every call.

    Returns:
        Config: The application configuration instance.

    Raises:
        ConfigurationError: If required environment variables are missing.
    """
    global _config_instance
    if _config_instance is None:
        _config_instance = Config.from_env()
    return _config_instance


# Module-level singleton instance
_config_instance: Optional[Config] = None


# Convenience export for direct access
config = get_config()
