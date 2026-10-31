from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models import Plan
from app.schemas.plan import PlanCreate, PlanOut, PlanUpdate

router = APIRouter(prefix="/plans", tags=["Planificaciones"])


def _get_plan_or_404(db: Session, plan_id: int) -> Plan:
    plan = db.get(Plan, plan_id)
    if plan is None:
        raise HTTPException(status_code=404, detail="Planificación no encontrada")
    return plan


@router.get("", response_model=list[PlanOut])
def list_plans(
    db: Session = Depends(get_db),
    q: str | None = Query(default=None, max_length=100),
    subject: str | None = Query(default=None, max_length=100),
) -> list[Plan]:
    query = select(Plan).order_by(Plan.created_at.desc(), Plan.id.desc())
    if q:
        search = f"%{q.strip()}%"
        query = query.where(or_(Plan.title.ilike(search), Plan.topic.ilike(search)))
    if subject:
        query = query.where(Plan.subject.ilike(subject.strip()))
    return list(db.scalars(query).all())


@router.post("", response_model=PlanOut, status_code=status.HTTP_201_CREATED)
def create_plan(payload: PlanCreate, db: Session = Depends(get_db)) -> Plan:
    plan = Plan(**payload.model_dump())
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


@router.get("/{plan_id}", response_model=PlanOut)
def get_plan(plan_id: int, db: Session = Depends(get_db)) -> Plan:
    return _get_plan_or_404(db, plan_id)


@router.put("/{plan_id}", response_model=PlanOut)
def update_plan(plan_id: int, payload: PlanUpdate, db: Session = Depends(get_db)) -> Plan:
    plan = _get_plan_or_404(db, plan_id)
    for field, value in payload.model_dump().items():
        setattr(plan, field, value)
    db.commit()
    db.refresh(plan)
    return plan


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plan(plan_id: int, db: Session = Depends(get_db)) -> Response:
    plan = _get_plan_or_404(db, plan_id)
    db.delete(plan)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
