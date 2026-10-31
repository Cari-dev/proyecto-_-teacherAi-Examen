from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.database.session import get_db
from app.models import Assessment, Question, QuestionOption
from app.schemas.assessment import AssessmentCreate, AssessmentOut, AssessmentSummary

router = APIRouter(prefix="/assessments", tags=["Evaluaciones"])


def _assessment_detail_query(assessment_id: int):
    return (
        select(Assessment)
        .options(selectinload(Assessment.questions).selectinload(Question.options))
        .where(Assessment.id == assessment_id)
    )


def _get_assessment_or_404(db: Session, assessment_id: int) -> Assessment:
    assessment = db.scalar(_assessment_detail_query(assessment_id))
    if assessment is None:
        raise HTTPException(status_code=404, detail="Evaluación no encontrada")
    return assessment


@router.get("", response_model=list[AssessmentSummary])
def list_assessments(db: Session = Depends(get_db)) -> list[Assessment]:
    query = (
        select(Assessment)
        .options(selectinload(Assessment.questions))
        .order_by(Assessment.created_at.desc(), Assessment.id.desc())
    )
    return list(db.scalars(query).all())


@router.post("", response_model=AssessmentOut, status_code=status.HTTP_201_CREATED)
def create_assessment(payload: AssessmentCreate, db: Session = Depends(get_db)) -> Assessment:
    assessment = Assessment(
        title=payload.title,
        subject=payload.subject,
        education_level=payload.education_level,
        instructions=payload.instructions,
    )

    for question_index, question_payload in enumerate(payload.questions):
        question = Question(text=question_payload.text, order_index=question_index)
        for option_index, option_text in enumerate(question_payload.options):
            question.options.append(
                QuestionOption(
                    text=option_text,
                    is_correct=option_index == question_payload.correct_option_index,
                    order_index=option_index,
                )
            )
        assessment.questions.append(question)

    db.add(assessment)
    db.commit()
    return _get_assessment_or_404(db, assessment.id)


@router.get("/{assessment_id}", response_model=AssessmentOut)
def get_assessment(assessment_id: int, db: Session = Depends(get_db)) -> Assessment:
    return _get_assessment_or_404(db, assessment_id)


@router.delete("/{assessment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_assessment(assessment_id: int, db: Session = Depends(get_db)) -> Response:
    assessment = _get_assessment_or_404(db, assessment_id)
    db.delete(assessment)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
