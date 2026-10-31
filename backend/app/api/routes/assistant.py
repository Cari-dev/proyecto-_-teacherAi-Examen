import logging
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.core.config import settings
from app.schemas.assistant import AssistantRequest, AssistantResponse
from app.services.demo_templates import generate_demo_content
from app.services.gemini_service import GeminiServiceError, generate_with_gemini

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/assistant", tags=["Asistente TeacherAI"])

DEMO_NOTICE = (
    "Modo demostración: respuesta generada con una plantilla local de TeacherAI. "
    "NO fue generada por Gemini."
)


@router.post("/generate", response_model=AssistantResponse)
async def generate_assistant_content(payload: AssistantRequest) -> AssistantResponse:
    if settings.assistant_mode == "demo":
        return AssistantResponse(
            content=generate_demo_content(payload),
            source="demo",
            model=None,
            notice=DEMO_NOTICE,
            generated_at=datetime.now(timezone.utc),
        )

    try:
        content = await generate_with_gemini(payload, settings)
    except GeminiServiceError as exc:
        logger.warning("Error controlado del asistente Gemini [%s]", exc.code)
        raise HTTPException(
            status_code=exc.status_code,
            detail=exc.public_message,
        ) from exc

    return AssistantResponse(
        content=content,
        source="gemini",
        model=settings.gemini_model,
        notice="Contenido generado con Gemini. Revisa y adapta el material antes de usarlo en clase.",
        generated_at=datetime.now(timezone.utc),
    )
