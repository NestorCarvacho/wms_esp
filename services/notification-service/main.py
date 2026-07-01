"""
Notification-service — FastAPI standalone (Fase 2 Strangler Fig).

REST inbox + WebSocket inventario + suscriptor Redis.
Reutiliza `app.modules.notifications` con NOTIFICATIONS_MODE=local.
"""
from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager

import redis.asyncio as redis
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.endpoints import notificaciones, ws_inventario
from app.core.config import (
    APP_NAME,
    APP_VERSION,
    CORS_ORIGINS,
    DEBUG,
    REDIS_URL,
)
from app.core.locale_middleware import LocaleMiddleware
from subscriber import run_stock_events_subscriber

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    stop_event = asyncio.Event()
    subscriber_task = asyncio.create_task(run_stock_events_subscriber(stop_event))
    logger.info("Notification-service iniciado (modo local interno)")
    yield
    stop_event.set()
    subscriber_task.cancel()
    try:
        await subscriber_task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title=f"{APP_NAME} — Notifications",
    version=APP_VERSION,
    description="Servicio de notificaciones: inbox, WebSocket inventario, email.",
    debug=DEBUG,
    lifespan=lifespan,
)

app.add_middleware(LocaleMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(notificaciones.router)
app.include_router(ws_inventario.router)


@app.get("/health", tags=["Status"])
async def health_check():
    redis_ok = False
    try:
        client = redis.from_url(REDIS_URL, decode_responses=True)
        redis_ok = await client.ping()
        await client.aclose()
    except Exception:
        redis_ok = False

    status_code = 200 if redis_ok else 503
    return JSONResponse(
        status_code=status_code,
        content={
            "status": "ok" if redis_ok else "degraded",
            "service": "notification-service",
            "redis": redis_ok,
            "version": APP_VERSION,
        },
    )


@app.get("/", tags=["Root"])
async def root():
    return JSONResponse(
        status_code=200,
        content={
            "mensaje": "WMS Notification Service",
            "version": APP_VERSION,
            "docs": "/docs",
        },
    )
