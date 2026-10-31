from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.session import get_db
from app.schemas.health import HealthResponse

router = APIRouter(tags=["Sistema"])


@router.get("/health", response_model=HealthResponse)
def health_check(db: Session = Depends(get_db)) -> HealthResponse:
    try:
        db.execute(text("SELECT 1"))
        database_status = "ok"
        status = "ok"
    except SQLAlchemyError:
        database_status = "error"
        status = "degraded"

    return HealthResponse(
        status=status,
        app=settings.app_name,
        version=settings.app_version,
        database=database_status,
        assistant_mode=settings.assistant_mode,
    )
