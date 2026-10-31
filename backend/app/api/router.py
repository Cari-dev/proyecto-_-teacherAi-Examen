from fastapi import APIRouter

from app.api.routes import activities, assessments, assistant, dashboard, health, plans

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(dashboard.router)
api_router.include_router(plans.router)
api_router.include_router(activities.router)
api_router.include_router(assessments.router)
api_router.include_router(assistant.router)
