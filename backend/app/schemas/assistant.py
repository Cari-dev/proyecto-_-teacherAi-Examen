from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_serializer, field_validator

from app.schemas.common import to_utc_iso

ContentType = Literal["ideas", "activities", "questions", "explanation", "adaptation"]


class AssistantRequest(BaseModel):
    topic: str = Field(min_length=3, max_length=300)
    subject: str = Field(min_length=2, max_length=100)
    education_level: str = Field(min_length=2, max_length=100)
    content_type: ContentType
    additional_instructions: str | None = Field(default=None, max_length=1500)

    @field_validator("topic", "subject", "education_level", "additional_instructions")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None


class AssistantResponse(BaseModel):
    content: str
    source: Literal["demo", "gemini"]
    model: str | None = None
    notice: str
    generated_at: datetime

    @field_serializer("generated_at")
    def serialize_generated_at(self, value: datetime) -> str:
        return to_utc_iso(value)
