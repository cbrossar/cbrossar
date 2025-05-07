from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import time
from logger import logger

def get_database_url():
    """Get database URL with retry logic for startup."""
    max_retries = 3
    retry_delay = 2  # seconds
    
    for attempt in range(max_retries):
        DATABASE_URL = os.getenv("DATABASE_URL")
        if DATABASE_URL:
            return DATABASE_URL
        
        if attempt < max_retries - 1:
            logger.warning(f"Database URL not found, retrying in {retry_delay} seconds... (Attempt {attempt + 1}/{max_retries})")
            time.sleep(retry_delay)
    
    raise ValueError("DATABASE_URL environment variable not set after multiple retries")

engine = create_engine(
    get_database_url(),
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=1800,  # Recycle connections after 30 minutes
    pool_pre_ping=True,  # Enable connection health checks
    connect_args={
        "sslmode": "require",
        "connect_timeout": 10
    }
)
SessionLocal = sessionmaker(bind=engine)

def get_session():
    """Create a new database session."""
    return SessionLocal()
