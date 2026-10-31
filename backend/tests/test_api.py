from fastapi.testclient import TestClient
from pydantic import SecretStr

from app.api.routes import assistant as assistant_route
from app.core.config import settings
from app.services.gemini_service import GeminiServiceError


def plan_payload() -> dict:
    return {
        "title": "Plan de prueba sobre ecosistemas",
        "subject": "Ciencia y Tecnología",
        "education_level": "Secundaria",
        "course": "2.º de secundaria",
        "topic": "Ecosistemas",
        "learning_objective": "Explicar las relaciones entre los componentes de un ecosistema.",
        "duration_minutes": 90,
        "content": "Componentes bióticos y abióticos. Relaciones ecológicas. Casos locales.",
        "activities": "Observación de un ecosistema cercano y elaboración de un esquema.",
        "resources": "Cuaderno, lápices, ficha de observación.",
    }


def activity_payload() -> dict:
    return {
        "title": "Maqueta de un ecosistema",
        "subject": "Ciencia y Tecnología",
        "education_level": "Secundaria",
        "topic": "Ecosistemas",
        "description": "Construir una maqueta que represente los componentes de un ecosistema local.",
        "activity_type": "Proyecto",
        "estimated_duration_minutes": 60,
    }


def assessment_payload() -> dict:
    return {
        "title": "Cuestionario de ecosistemas",
        "subject": "Ciencia y Tecnología",
        "education_level": "Secundaria",
        "instructions": "Marca una sola respuesta correcta por pregunta.",
        "questions": [
            {
                "text": "¿Qué componente es abiótico?",
                "options": ["Agua", "Árbol", "Ave", "Hongos"],
                "correct_option_index": 0,
            },
            {
                "text": "¿Qué relación ocurre cuando un animal se alimenta de otro?",
                "options": ["Mutualismo", "Depredación", "Competencia", "Simbiosis"],
                "correct_option_index": 1,
            },
        ],
    }


def test_health(client: TestClient) -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "ok"
    assert data["assistant_mode"] == "demo"


def test_dashboard_updates_from_database(client: TestClient) -> None:
    initial = client.get("/api/dashboard")
    assert initial.status_code == 200
    assert initial.json()["stats"] == {"plans": 0, "activities": 0, "assessments": 0, "questions": 0}

    assert client.post("/api/plans", json=plan_payload()).status_code == 201
    assert client.post("/api/activities", json=activity_payload()).status_code == 201
    assert client.post("/api/assessments", json=assessment_payload()).status_code == 201

    data = client.get("/api/dashboard").json()
    assert data["stats"]["plans"] == 1
    assert data["stats"]["activities"] == 1
    assert data["stats"]["assessments"] == 1
    assert data["stats"]["questions"] == 2
    assert len(data["latest_plans"]) == 1
    assert data["latest_plans"][0]["title"] == plan_payload()["title"]


def test_plan_crud(client: TestClient) -> None:
    created = client.post("/api/plans", json=plan_payload())
    assert created.status_code == 201
    plan_id = created.json()["id"]

    listed = client.get("/api/plans")
    assert listed.status_code == 200
    assert len(listed.json()) == 1

    detail = client.get(f"/api/plans/{plan_id}")
    assert detail.status_code == 200
    assert detail.json()["topic"] == "Ecosistemas"

    updated_payload = plan_payload()
    updated_payload["title"] = "Plan actualizado de ecosistemas"
    updated = client.put(f"/api/plans/{plan_id}", json=updated_payload)
    assert updated.status_code == 200
    assert updated.json()["title"] == "Plan actualizado de ecosistemas"

    deleted = client.delete(f"/api/plans/{plan_id}")
    assert deleted.status_code == 204
    assert client.get(f"/api/plans/{plan_id}").status_code == 404


def test_plan_validation_rejects_invalid_data(client: TestClient) -> None:
    payload = plan_payload()
    payload["duration_minutes"] = 0
    response = client.post("/api/plans", json=payload)
    assert response.status_code == 422


def test_activity_create_detail_and_delete(client: TestClient) -> None:
    created = client.post("/api/activities", json=activity_payload())
    assert created.status_code == 201
    activity_id = created.json()["id"]

    detail = client.get(f"/api/activities/{activity_id}")
    assert detail.status_code == 200
    assert detail.json()["activity_type"] == "Proyecto"

    assert client.delete(f"/api/activities/{activity_id}").status_code == 204
    assert client.get(f"/api/activities/{activity_id}").status_code == 404


def test_assessment_create_detail_and_delete(client: TestClient) -> None:
    created = client.post("/api/assessments", json=assessment_payload())
    assert created.status_code == 201
    data = created.json()
    assert data["question_count"] == 2
    assert len(data["questions"]) == 2
    correct_options = [option for option in data["questions"][0]["options"] if option["is_correct"]]
    assert len(correct_options) == 1
    assert correct_options[0]["text"] == "Agua"

    assessment_id = data["id"]
    listed = client.get("/api/assessments")
    assert listed.status_code == 200
    assert listed.json()[0]["question_count"] == 2

    assert client.get(f"/api/assessments/{assessment_id}").status_code == 200
    assert client.delete(f"/api/assessments/{assessment_id}").status_code == 204
    assert client.get(f"/api/assessments/{assessment_id}").status_code == 404


def test_assessment_validation_rejects_invalid_correct_index(client: TestClient) -> None:
    payload = assessment_payload()
    payload["questions"][0]["correct_option_index"] = 8
    response = client.post("/api/assessments", json=payload)
    assert response.status_code == 422


def test_assistant_demo_is_clearly_identified(client: TestClient) -> None:
    response = client.post(
        "/api/assistant/generate",
        json={
            "topic": "Fracciones equivalentes",
            "subject": "Matemática",
            "education_level": "Primaria",
            "content_type": "ideas",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["source"] == "demo"
    assert data["model"] is None
    assert "NO fue generada por Gemini" in data["notice"]
    assert "PLANTILLA LOCAL" in data["content"]
    assert "Fracciones equivalentes" in data["content"]


def test_health_detects_gemini_without_exposing_key(
    client: TestClient, monkeypatch
) -> None:
    secret = "clave-gemini-de-prueba"
    monkeypatch.setattr(settings, "gemini_api_key", SecretStr(secret))

    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json()["assistant_mode"] == "gemini"
    assert secret not in response.text


def test_assistant_gemini_success(client: TestClient, monkeypatch) -> None:
    secret = "clave-gemini-de-prueba"
    monkeypatch.setattr(settings, "gemini_api_key", SecretStr(secret))

    async def fake_generate(payload, _settings):
        assert payload.subject == "Matemática"
        assert payload.education_level == "Secundaria"
        assert payload.content_type == "activities"
        return "Actividad de fracciones generada por Gemini."

    monkeypatch.setattr(assistant_route, "generate_with_gemini", fake_generate)

    response = client.post(
        "/api/assistant/generate",
        json={
            "topic": "Fracciones equivalentes",
            "subject": "Matemática",
            "education_level": "Secundaria",
            "content_type": "activities",
            "additional_instructions": "Trabajar en parejas.",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["source"] == "gemini"
    assert data["model"] == settings.gemini_model
    assert data["content"] == "Actividad de fracciones generada por Gemini."
    assert "Gemini" in data["notice"]
    assert secret not in response.text


def test_assistant_gemini_errors_are_sanitized(client: TestClient, monkeypatch) -> None:
    secret = "clave-gemini-de-prueba"
    monkeypatch.setattr(settings, "gemini_api_key", SecretStr(secret))

    async def fake_generate(_payload, _settings):
        raise GeminiServiceError(
            "Se alcanzó el límite de solicitudes de Gemini.",
            status_code=429,
            code="gemini_rate_limit",
        )

    monkeypatch.setattr(assistant_route, "generate_with_gemini", fake_generate)

    response = client.post(
        "/api/assistant/generate",
        json={
            "topic": "Fracciones equivalentes",
            "subject": "Matemática",
            "education_level": "Secundaria",
            "content_type": "activities",
        },
    )

    assert response.status_code == 429
    assert response.json()["detail"] == "Se alcanzó el límite de solicitudes de Gemini."
    assert secret not in response.text


def test_assistant_rejects_oversized_request(client: TestClient) -> None:
    response = client.post(
        "/api/assistant/generate",
        json={
            "topic": "Fracciones equivalentes",
            "subject": "Matemática",
            "education_level": "Secundaria",
            "content_type": "activities",
            "additional_instructions": "x" * 1501,
        },
    )

    assert response.status_code == 422


def test_not_found_responses(client: TestClient) -> None:
    assert client.get("/api/plans/999").status_code == 404
    assert client.get("/api/activities/999").status_code == 404
    assert client.get("/api/assessments/999").status_code == 404
