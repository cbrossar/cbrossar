from loguru import logger
import os

# Make sure logs folder exists
os.makedirs("logs", exist_ok=True)

# Remove default Loguru logger
logger.remove()

# Configure Loguru
logger.add(
    "logs/script.log",
    rotation="10 MB",    # Rotate after 10MB
    retention="10 days", # Keep logs for 10 days
    compression="zip",   # Compress old logs
    level="INFO",        # Log level
    backtrace=True,
    diagnose=True,
)

# Optional: also log to stdout (console)
logger.add(
    sink=lambda msg: print(msg, end=""),
    level="INFO",
)

# Export logger for use
__all__ = ["logger"]
