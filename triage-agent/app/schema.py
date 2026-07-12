"""Structured output schema for issue triage."""
from enum import Enum
from typing import List

from pydantic import BaseModel, Field


class IssueType(str, Enum):
    bug = "bug"
    feature_request = "feature_request"
    question = "question"
    documentation = "documentation"


class Priority(str, Enum):
    critical = "critical"
    high = "high"
    medium = "medium"
    low = "low"


class Component(str, Enum):
    api = "api"
    ui = "ui"
    auth = "auth"
    database = "database"
    build = "build"
    docs = "docs"
    other = "other"


class TriageResult(BaseModel):
    issue_type: IssueType = Field(description="What kind of issue this is")
    priority: Priority = Field(
        description="critical = data loss / security / total outage; "
                    "high = core feature broken for many users; "
                    "medium = broken with a workaround; low = cosmetic or minor"
    )
    component: Component = Field(description="The area of the codebase most affected")
    labels: List[str] = Field(description="2-4 short lowercase labels for the issue tracker")
    summary: str = Field(description="One-sentence summary of the issue")
    response_draft: str = Field(
        description="A short, friendly first response to the reporter: acknowledge, "
                    "ask for missing info if needed, set expectations"
    )
