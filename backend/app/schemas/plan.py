from datetime import datetime

from pydantic import BaseModel, Field, field_serializer, field_validator

from app.schemas.common import ORMModel, to_utc_iso


class PlanBase(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    subject: str = Field(min_length=2, max_length=100)
    education_level: str = Field(min_length=2, max_length=100)
    course: str = Field(min_length=1, max_length=100)
    topic: str = Field(min_length=2, max_length=200)
    learning_objective: str = Field(min_length=10, max_length=5000)
    duration_minutes: int = Field(ge=5, le=1200)
    content: str = Field(min_length=10, max_length=10000)
    activities: str = Field(min_length=10, max_length=10000)
    resources: str = Field(min_length=3, max_length=5000)

    @field_validator(
        "title",
        "subject",
        "education_level",
        "course",
        "topic",
        "learning_objective",
        "content",
        "activities",
        "resources",
    )
    @classmethod
    def strip_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("El campo no puede estar vacío")
        return cleaned


class PlanCreate(PlanBase):
    pass


class PlanUpdate(PlanBase):
    pass


class PlanOut(ORMModel):
    id: int
    title: str
    subject: str
    education_level: str
    course: str
    topic: str
    learning_objective: str
    duration_minutes: int
    content: str
    activities: str
    resources: str
    is_demo: bool
    created_at: datetime
    updated_at: datetime

    @field_serializer("created_at", "updated_at")
    def serialize_dates(self, value: datetime) -> str:
        return to_utc_iso(value)
