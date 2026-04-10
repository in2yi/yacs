from fastapi import APIRouter, Request, Response, status
from fastapi.responses import JSONResponse

from schemas.api_models import PreferredSemesterPydantic, UserPydantic, UserProfileUpdatePydantic, UserDeletePydantic
from services import user_service

router = APIRouter(prefix="/api", tags=["Users"])


@router.post('/user')
async def add_user(user: UserPydantic):
    """Create a new user account."""
    result = user_service.create_user(user.dict())
    if result.get("success"):
        return JSONResponse(status_code=status.HTTP_201_CREATED, content=result)
    return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=result)


@router.delete('/user')
async def delete_user(request: Request, payload: UserDeletePydantic):
    """Delete the currently logged-in user after password verification."""
    if 'user' not in request.session:
        return Response("Not authorized", status_code=403)
    user_id = request.session['user']['user_id']
    result = user_service.delete_current_user(user_id, payload.password)
    if result.get("success"):
        request.session.clear()
    return result


@router.put('/user/preferred-semester')
async def set_preferred_semester(request: Request, payload: PreferredSemesterPydantic):
    """Update preferred semester for the current user."""
    if 'user' not in request.session:
        return Response("Not authorized", status_code=403)
    user_id = request.session['user']['user_id']
    return user_service.update_preferred_semester(user_id, payload.preferred_semester)


@router.put('/user/profile')
async def update_user_profile(request: Request, payload: UserProfileUpdatePydantic):
    """Update the current user's profile (name, major, degree, phone)."""
    if 'user' not in request.session:
        return Response("Not authorized", status_code=403)
    user_id = request.session['user']['user_id']
    return user_service.update_user_profile(user_id, payload.dict(exclude_unset=True))
