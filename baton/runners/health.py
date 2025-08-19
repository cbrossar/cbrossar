from db import Session
from logger import logger
from models import FantasyPlayers
from datetime import datetime


def run_health_check():
    logger.info("Starting health check")

    start_time = datetime.now()

    with Session() as session:
        count = session.query(FantasyPlayers).count()
        logger.info(f"Number of fantasy players: {count}")

    end_time = datetime.now()
    duration = end_time - start_time
    logger.info(f"Health check completed in {duration.total_seconds():.2f} seconds")
    return True
