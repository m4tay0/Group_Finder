from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# --- VERCEL İÇİN GEÇİCİ ÇÖZÜM ---
TEMP_DATABASE_URL = "sqlite:////tmp/groupfinder.db"

# SQLite compatibility check
connect_args = {"check_same_thread": False}

# engine oluştururken settings.DATABASE_URL yerine TEMP_DATABASE_URL kullanıyoruz
engine = create_engine(
    TEMP_DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
