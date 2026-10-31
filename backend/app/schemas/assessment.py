from datetime import datetime

from pydantic import BaseModel, Field, field_serializer, field_validator, model_validator

from app.schemas.common import ORMModel, to_utc_iso


class QuestionCreate(BaseModel):
    text: str = Field(min_length=3, max_length=2000)
    options: list[str] = Field(min_length=2, max_length=8)
    correct_option_index: int = Field(ge=0)

    @field_validator("text")
    @classmethod
    def strip_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("El enunciado no puede estar vacío")
        return cleaned

    @field_validator("options")
    @classmethod
    def validate_options(cls, values: list[str]) -> list[str]:
        cleaned = [value.strip() for value in values]
        if any(not value for value in cleaned):
            raise ValueError("Todas las opciones deben tener texto")
        if len(set(cleaned)) != len(cleaned):
            raise ValueError("Las opciones de una pregunta no pueden repetirse")
        return cleaned

    @model_validator(mode="after")
    def validate_correct_option(self) -> "QuestionCreate":
        if self.correct_option_index >= len(self.options):
            raise ValueError("La respuesta correcta debe corresponder a una de las opciones")
        return self


class AssessmentCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    subject: str = Field(min_length=2, max_length=100)
    education_level: str = Field(min_length=2, max_length=100)
    instructions: str = Field(min_length=5, max_length=5000)
    questions: list[QuestionCreate] = Field(min_length=1, max_length=50)

    @field_validator("title", "subject", "education_level", "instructions")
    @classmethod
    def strip_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("El campo no puede estar vacío")
        return cleaned


class OptionOut(ORMModel):
    id: int
    text: str
    is_correct: bool
    order_index: int


class QuestionOut(ORMModel):
    id: int
    text: str
    order_index: int
    options: list[OptionOut]


class AssessmentSummary(ORMModel):
    id: int
    title: str
    subject: str
    education_level: str
    instructions: str
    is_demo: bool
    created_at: datetime
    question_count: int

    @field_serializer("created_at")
    def serialize_dates(self, value: datetime) -> str:
        return to_utc_iso(value)


class AssessmentOut(AssessmentSummary):
    questions: list[QuestionOut]
