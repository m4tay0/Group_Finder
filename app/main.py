from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, SessionLocal
from app import models  # Ensure models are loaded to create tables
from app.routers import ogrenci, hoca
from app.config import settings
from app.seed import seed_db
from contextlib import asynccontextmanager

# Automatically create database tables on startup
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run DB Seeding on startup
    db = SessionLocal()
    try:
        seed_db(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Enable CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(ogrenci.router, prefix=f"{settings.API_V1_STR}/ogrenci", tags=["Öğrenci"])
app.include_router(hoca.router, prefix=f"{settings.API_V1_STR}/hoca", tags=["Hoca"])

@app.get("/")
def root():
    return {
        "status": "online",
        "message": f"Welcome to {settings.PROJECT_NAME} API. Access Swagger UI at /docs or /redoc"
    }

if __name__ == "__main__":
    import uvicorn
    # Start the server locally
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
