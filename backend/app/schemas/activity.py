from datetime import datetime

from pydantic import BaseModel, Field, field_serializer, field_validator

from app.schemas.common import ORMModel, to_utc_iso


class ActivityBase(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    subject: str = Field(min_length=2, max_length=100)
    education_level: str = Field(min_length=2, max_length=100)
    topic: str = Field(min_length=2, max_length=200)
    description: str = Field(min_length=10, max_length=5000)
    activity_type: str = Field(min_length=2, max_length=80)
    estimated_duration_minutes: int = Field(ge=5, le=600)

    @field_validator("title", "subject", "education_level", "topic", "description", "activity_type")
    @classmethod
    def strip_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("El campo no puede estar vacío")
        return cleaned


class ActivityCreate(ActivityBase):
    pass


class ActivityOut(ORMModel):
    id: int
    title: str
    subject: str
    education_level: str
    topic: str
    description: str
    activity_type: str
    estimated_duration_minutes: int
    is_demo: bool
    created_at: datetime

    @field_serializer("created_at")
    def serialize_dates(self, value: datetime) -> str:
        return to_utc_iso(value)
