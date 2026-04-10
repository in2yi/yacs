#!/usr/bin/python3
from contextlib import asynccontextmanager
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from middleware.admin_middleware import AdminMiddleware
from routers import user_router, auth_router, corequisite_router, admin_router
from models import init_db
from utils import load_secrets


def _as_bool(value, default=False):
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


# --- Lifespan (startup/shutdown events) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create database tables
    init_db()
    yield
    # Shutdown: cleanup if needed


# --- Initialize FastAPI App ---
app = FastAPI(lifespan=lifespan)

# --- Add Middleware ---
secrets = load_secrets()

# Determine allowed origins based on environment
allowed_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
allowed_origins = [origin.strip() for origin in allowed_origins]

app.add_middleware(
    SessionMiddleware,
    secret_key=secrets.get("SECRET_KEY", "dev_secret_key"),
    same_site=secrets.get("SESSION_SAME_SITE", "lax"),
    https_only=_as_bool(secrets.get("SESSION_HTTPS_ONLY"), default=False),
    max_age=int(secrets.get("SESSION_MAX_AGE_SECONDS", 12 * 60 * 60)),
)
app.add_middleware(AdminMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Include Routers ---
app.include_router(user_router.router)
app.include_router(auth_router.router)
app.include_router(corequisite_router.router)
app.include_router(admin_router.router)


# --- Root Endpoint ---
@app.get('/')
async def root():
    """Confirms the API is running."""
    return {"message": "YACS API is Up!"}
