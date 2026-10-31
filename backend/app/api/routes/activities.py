from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models import Activity
from app.schemas.activity import ActivityCreate, ActivityOut

router = APIRouter(prefix="/activities", tags=["Actividades"])


def _get_activity_or_404(db: Session, activity_id: int) -> Activity:
    activity = db.get(Activity, activity_id)
    if activity is None:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")
    return activity


@router.get("", response_model=list[ActivityOut])
def list_activities(
    db: Session = Depends(get_db),
    q: str | None = Query(default=None, max_length=100),
) -> list[Activity]:
    query = select(Activity).order_by(Activity.created_at.desc(), Activity.id.desc())
    if q:
        search = f"%{q.strip()}%"
        query = query.where(
            or_(Activity.title.ilike(search), Activity.topic.ilike(search), Activity.subject.ilike(search))
        )
    return list(db.scalars(query).all())


@router.post("", response_model=ActivityOut, status_code=status.HTTP_201_CREATED)
def create_activity(payload: ActivityCreate, db: Session = Depends(get_db)) -> Activity:
    activity = Activity(**payload.model_dump())
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


@router.get("/{activity_id}", response_model=ActivityOut)
def get_activity(activity_id: int, db: Session = Depends(get_db)) -> Activity:
    return _get_activity_or_404(db, activity_id)


@router.delete("/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_activity(activity_id: int, db: Session = Depends(get_db)) -> Response:
    activity = _get_activity_or_404(db, activity_id)
    db.delete(activity)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
