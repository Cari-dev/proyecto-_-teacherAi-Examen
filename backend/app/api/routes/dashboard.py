from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.session import get_db
from app.models import Activity, Assessment, Plan, Question
from app.schemas.dashboard import DashboardOut, DashboardStats, RecentPlan

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardOut)
def get_dashboard(db: Session = Depends(get_db)) -> DashboardOut:
    plans_count = db.scalar(select(func.count()).select_from(Plan)) or 0
    activities_count = db.scalar(select(func.count()).select_from(Activity)) or 0
    assessments_count = db.scalar(select(func.count()).select_from(Assessment)) or 0
    questions_count = db.scalar(select(func.count()).select_from(Question)) or 0

    latest_plans = db.scalars(
        select(Plan).order_by(Plan.created_at.desc(), Plan.id.desc()).limit(5)
    ).all()

    return DashboardOut(
        teacher_name=settings.teacher_name,
        assistant_mode=settings.assistant_mode,
        stats=DashboardStats(
            plans=plans_count,
            activities=activities_count,
            assessments=assessments_count,
            questions=questions_count,
        ),
        latest_plans=[
            RecentPlan(
                id=plan.id,
                title=plan.title,
                subject=plan.subject,
                education_level=plan.education_level,
                created_at=plan.created_at,
                is_demo=plan.is_demo,
            )
            for plan in latest_plans
        ],
    )
