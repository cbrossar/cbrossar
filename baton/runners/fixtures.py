from logger import logger
from utils.fpl import get_fixtures


def run_fixtures():
    logger.info("Running fixtures update")
    fixtures = get_fixtures()

    logger.info(f"Number of fixtures: {len(fixtures)}")
