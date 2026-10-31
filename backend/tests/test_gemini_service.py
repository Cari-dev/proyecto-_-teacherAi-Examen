import asyncio
from dataclasses import dataclass

import httpx
import pytest
from google.genai import errors

from app.schemas.assistant import AssistantRequest
from app.services import gemini_service


def assistant_payload() -> AssistantRequest:
    return AssistantRequest(
        topic="Fracciones equivalentes",
        subject="Matemática",
        education_level="Secundaria",
        content_type="activities",
        additional_instructions="Trabajar en parejas durante 20 minutos.",
    )


@dataclass
class CapturedCall:
    client_kwargs: dict
    generate_kwargs: dict


class FakeResponse:
    def __init__(self, text: str | None) -> None:
        self.text = text


def install_fake_client(
    monkeypatch: pytest.MonkeyPatch,
    *,
    text: str | None = "Contenido generado",
    error: Exception | None = None,
) -> CapturedCall:
    captured = CapturedCall(client_kwargs={}, generate_kwargs={})

    class FakeModels:
        def generate_content(self, **kwargs):
            captured.generate_kwargs.update(kwargs)
            if error is not None:
                raise error
            return FakeResponse(text)

    class FakeClient:
        def __init__(self, **kwargs):
            captured.client_kwargs.update(kwargs)
            self.models = FakeModels()

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc_value, traceback):
            return False

    monkeypatch.setattr(gemini_service.genai, "Client", FakeClient)
    return captured


def test_generate_sync_uses_official_sdk_configuration(monkeypatch: pytest.MonkeyPatch) -> None:
    captured = install_fake_client(monkeypatch, text="Actividad lista")

    result = gemini_service._generate_sync(assistant_payload(), "clave-de-prueba", "gemini-3.6-flash")

    assert result == "Actividad lista"
    assert captured.client_kwargs["api_key"] == "clave-de-prueba"
    http_options = captured.client_kwargs["http_options"]
    assert http_options.timeout == 45_000
    assert http_options.retry_options.attempts == 2

    assert captured.generate_kwargs["model"] == "gemini-3.6-flash"
    prompt = captured.generate_kwargs["contents"]
    assert "Fracciones equivalentes" in prompt
    assert "Matemática" in prompt
    assert "Secundaria" in prompt
    assert "Trabajar en parejas" in prompt

    config = captured.generate_kwargs["config"]
    assert config.system_instruction == gemini_service.SYSTEM_INSTRUCTION
    assert config.max_output_tokens == 3_000


@pytest.mark.parametrize("content_type", ["ideas", "activities", "questions", "explanation", "adaptation"])
def test_build_prompt_covers_all_content_types(content_type: str) -> None:
    payload = assistant_payload()
    payload.content_type = content_type

    prompt = gemini_service.build_prompt(payload)

    assert gemini_service.CONTENT_TYPE_INSTRUCTIONS[content_type] in prompt


@pytest.mark.parametrize(
    ("code", "expected_status", "expected_code"),
    [
        (401, 503, "gemini_auth"),
        (403, 503, "gemini_auth"),
        (404, 503, "gemini_model"),
        (429, 429, "gemini_rate_limit"),
        (500, 503, "gemini_unavailable"),
        (400, 502, "gemini_request"),
    ],
)
def test_api_errors_are_mapped_without_leaking_details(
    monkeypatch: pytest.MonkeyPatch,
    code: int,
    expected_status: int,
    expected_code: str,
) -> None:
    api_error = errors.ClientError(
        code,
        {"error": {"code": code, "status": "TEST", "message": "detalle-sensible"}},
        None,
    )
    install_fake_client(monkeypatch, error=api_error)

    with pytest.raises(gemini_service.GeminiServiceError) as exc_info:
        gemini_service._generate_sync(assistant_payload(), "clave-de-prueba", "gemini-3.6-flash")

    error = exc_info.value
    assert error.status_code == expected_status
    assert error.code == expected_code
    assert "detalle-sensible" not in str(error)
    assert "clave-de-prueba" not in str(error)


def test_timeout_and_connection_errors_are_mapped(monkeypatch: pytest.MonkeyPatch) -> None:
    install_fake_client(monkeypatch, error=httpx.ReadTimeout("timeout"))
    with pytest.raises(gemini_service.GeminiServiceError) as timeout_error:
        gemini_service._generate_sync(assistant_payload(), "clave-de-prueba", "gemini-3.6-flash")
    assert timeout_error.value.status_code == 504
    assert timeout_error.value.code == "gemini_timeout"

    install_fake_client(monkeypatch, error=httpx.ConnectError("connection"))
    with pytest.raises(gemini_service.GeminiServiceError) as connection_error:
        gemini_service._generate_sync(assistant_payload(), "clave-de-prueba", "gemini-3.6-flash")
    assert connection_error.value.status_code == 503
    assert connection_error.value.code == "gemini_connection"


def test_empty_response_is_rejected(monkeypatch: pytest.MonkeyPatch) -> None:
    install_fake_client(monkeypatch, text=None)

    with pytest.raises(gemini_service.GeminiServiceError) as exc_info:
        gemini_service._generate_sync(assistant_payload(), "clave-de-prueba", "gemini-3.6-flash")

    assert exc_info.value.status_code == 502
    assert exc_info.value.code == "gemini_empty"


def test_generate_without_key_is_rejected() -> None:
    class StubSettings:
        gemini_api_key_value = ""
        gemini_model = "gemini-3.6-flash"

    with pytest.raises(gemini_service.GeminiServiceError) as exc_info:
        asyncio.run(gemini_service.generate_with_gemini(assistant_payload(), StubSettings()))

    assert exc_info.value.status_code == 503
    assert exc_info.value.code == "gemini_not_configured"


def test_generate_async_returns_text(monkeypatch: pytest.MonkeyPatch) -> None:
    install_fake_client(monkeypatch, text="Contenido asíncrono")

    class StubSettings:
        gemini_api_key_value = "clave-de-prueba"
        gemini_model = "gemini-3.6-flash"

    result = asyncio.run(gemini_service.generate_with_gemini(assistant_payload(), StubSettings()))

    assert result == "Contenido asíncrono"
