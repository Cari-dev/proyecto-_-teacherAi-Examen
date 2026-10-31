from datetime import datetime

from pydantic import BaseModel, field_serializer

from app.schemas.common import to_utc_iso


class DashboardStats(BaseModel):
    plans: int
    activities: int
    assessments: int
    questions: int


class RecentPlan(BaseModel):
    id: int
    title: str
    subject: str
    education_level: str
    created_at: datetime
    is_demo: bool

    @field_serializer("created_at")
    def serialize_created_at(self, value: datetime) -> str:
        return to_utc_iso(value)


class DashboardOut(BaseModel):
    teacher_name: str
    assistant_mode: str
    stats: DashboardStats
    latest_plans: list[RecentPlan]
