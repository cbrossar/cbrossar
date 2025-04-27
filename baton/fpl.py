from db import get_session
from logger import logger
from models import Teams

session = get_session()

count = session.query(Teams).count()
logger.info(f"Number of teams: {count}")
session.close()