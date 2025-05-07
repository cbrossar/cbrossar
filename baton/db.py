from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from logger import logger
import os

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    logger.error("DATABASE_URL environment variable not set")

engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as connection:
        logger.info("Database connection successful")
except Exception as e:
    logger.error(f"Database connection failed: {e}")

SessionLocal = sessionmaker(bind=engine)

def get_session():
    """Create a new database session."""
    return SessionLocal()
