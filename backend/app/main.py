import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.api.router import api_router
from app.core.config import settings
from app.database.init_db import init_db

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title=f"{settings.app_name} API",
    description="API REST para la gestión de planificaciones, actividades, evaluaciones y asistencia educativa.",
    version=settings.app_version,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.exception_handler(SQLAlchemyError)
async def database_exception_handler(_request: Request, exc: SQLAlchemyError) -> JSONResponse:
    logger.exception("Error de base de datos", exc_info=exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Ocurrió un error al procesar la operación en la base de datos."},
    )


@app.get("/", tags=["Sistema"])
def root() -> dict[str, str]:
    return {
        "app": settings.app_name,
        "message": "API funcionando correctamente.",
        "docs": "/docs",
        "health": "/api/health",
    }
