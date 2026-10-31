from datetime import datetime, timezone

from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


def to_utc_iso(value: datetime) -> str:
    """SQLite devuelve fechas sin zona horaria; las serializamos como UTC."""
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc).isoformat()
