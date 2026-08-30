"""
ORCA FastAPI Application Entrypoint
SIH 2026 / ISRO Problem Statement SIH26176
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router as api_v1_router

app = FastAPI(
    title="ORCA — Marine Intelligence Decision Support API",
    description="Agentic marine decision support system correlating oceanographic, meteorological, EO satellite, and geospatial data.",
    version="2.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routes under /api and /api/v1
app.include_router(api_v1_router, prefix="/api/v1")
app.include_router(api_v1_router, prefix="/api")


@app.get("/")
async def root():
    return {
        "system": "ORCA",
        "title": "Marine EcOsystem Reasoning with Collaborative Agents",
        "organization": "Indian Space Research Organisation (ISRO)",
        "theme": "Space Technology / SIH26176",
        "status": "ONLINE",
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "system": "ORCA",
        "version": "2.0.0"
    }
