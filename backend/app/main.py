from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import connect_db, disconnect_db
from app.routes.predictions import router as predictions_router
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await disconnect_db()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "UCRIS FastAPI Backend — ML predictions, analytics, RAG chatbot. "
        "Auth and CRUD handled by Next.js SSR."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predictions_router)


@app.get("/", tags=["Health"])
async def root():
    return {
        "system":  "UCRIS API",
        "version": settings.APP_VERSION,
        "status":  "running",
        "endpoints": [
            "POST /api/predict",
            "GET  /api/predictions/{customer_id}",
            "GET  /api/analytics",
            "POST /api/chat",
        ]
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}