"""
Configuration settings for the Baton application
"""
import os
from typing import Optional

class Config:
    """Application configuration"""
    
    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    
    # Database connection pool settings
    DB_POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", "5"))
    DB_MAX_OVERFLOW: int = int(os.getenv("DB_MAX_OVERFLOW", "10"))
    DB_POOL_RECYCLE: int = int(os.getenv("DB_POOL_RECYCLE", "3600"))  # 1 hour
    DB_POOL_TIMEOUT: int = int(os.getenv("DB_POOL_TIMEOUT", "30"))
    DB_CONNECT_TIMEOUT: int = int(os.getenv("DB_CONNECT_TIMEOUT", "10"))
    
    # Retry settings
    DB_MAX_RETRIES: int = int(os.getenv("DB_MAX_RETRIES", "3"))
    DB_RETRY_DELAY: int = int(os.getenv("DB_RETRY_DELAY", "1"))
    
    # Reddit settings
    REDDIT_CLIENT_ID: Optional[str] = os.getenv("REDDIT_CLIENT_ID")
    REDDIT_CLIENT_SECRET: Optional[str] = os.getenv("REDDIT_CLIENT_SECRET")
    
    # Application settings
    APP_NAME: str = os.getenv("APP_NAME", "baton")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # Health check settings
    HEALTH_CHECK_TIMEOUT: int = int(os.getenv("HEALTH_CHECK_TIMEOUT", "30"))
    
    @classmethod
    def validate(cls) -> bool:
        """Validate that required configuration is present"""
        required_vars = ["DATABASE_URL"]
        
        missing_vars = []
        for var in required_vars:
            if not getattr(cls, var):
                missing_vars.append(var)
        
        if missing_vars:
            print(f"Missing required environment variables: {', '.join(missing_vars)}")
            return False
        
        return True
    
    @classmethod
    def get_database_config(cls) -> dict:
        """Get database configuration as a dictionary"""
        return {
            "pool_size": cls.DB_POOL_SIZE,
            "max_overflow": cls.DB_MAX_OVERFLOW,
            "pool_recycle": cls.DB_POOL_RECYCLE,
            "pool_timeout": cls.DB_POOL_TIMEOUT,
            "connect_args": {
                "connect_timeout": cls.DB_CONNECT_TIMEOUT,
                "application_name": cls.APP_NAME
            }
        }

