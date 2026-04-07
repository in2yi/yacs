from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from typing import Optional

from models import SessionLocal
from models.login_activity import LoginActivity
from schemas.api_models import RoleUpdatePydantic
from services import user_service

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/users")
def list_users():
    """List all registered users for admin review."""
    result = user_service.list_users()
    return JSONResponse(status_code=status.HTTP_200_OK, content=result)


@router.put("/users/{user_id}/role")
def update_user_role(user_id: int, payload: RoleUpdatePydantic):
    """Promote or demote a user to a specific role."""
    result = user_service.set_user_role(user_id, payload.role)
    if result.get("success"):
        return JSONResponse(status_code=status.HTTP_200_OK, content=result)
    return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=result)


@router.get("/activity-logs")
def get_activity_logs(user_id: Optional[int] = None, limit: int = 100):
    """Retrieve login/logout activity logs for all users or a specific user. Admins only."""
    db = SessionLocal()
    try:
        query = db.query(LoginActivity).order_by(LoginActivity.timestamp.desc())
        if user_id is not None:
            query = query.filter(LoginActivity.user_id == user_id)
        
        logs = query.limit(max(1, min(limit, 500))).all()
        return JSONResponse(status_code=status.HTTP_200_OK, content={
            "success": True,
            "status": "success",
            "logs": [
                {
                    "id": log.id,
                    "user_id": log.user_id,
                    "action": log.action,
                    "timestamp": log.timestamp.isoformat(),
                    "ip_address": log.ip_address,
                }
                for log in logs
            ],
        })
    finally:
        db.close()
