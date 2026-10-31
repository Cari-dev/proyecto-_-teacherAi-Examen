import logging

from app.core.config import settings
from app.database.base import Base
from app.database.seed import seed_demo_data
from app.database.session import SessionLocal, engine

logger = logging.getLogger(__name__)


def init_db() -> None:
    """Crea las tablas y carga los datos de demostración si corresponde."""
    import app.models  # noqa: F401  Registra todos los modelos en Base.metadata

    Base.metadata.create_all(bind=engine)

    if not settings.seed_demo_data:
        return

    with SessionLocal() as db:
        try:
            seed_demo_data(db)
        except Exception:
            db.rollback()
            logger.exception("No se pudieron cargar los datos de demostración")
