import os
from pydantic_settings import BaseSettings
from app.constants import DATABASE_SQLITE_URL, API_PREFIX

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", DATABASE_SQLITE_URL)
    PROJECT_NAME: str = "Group Finder MVP"
    API_V1_STR: str = API_PREFIX

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
