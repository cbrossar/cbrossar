from utils.fpl import get_my_team, get_fpl_general_info, get_fpl_player
from datetime import datetime
from logger import logger


def run_manager():
    logger.info("Starting manager task")
    start_time = datetime.now()

    general_info = get_fpl_general_info()

    current_gameweek = None
    for event in general_info["events"]:
        if event["is_current"]:
            current_gameweek = event["id"]

    my_team = get_my_team(current_gameweek)

    my_player_ids = [pick["element"] for pick in my_team["picks"]]

    if my_team is None:
        logger.info("Not updating manager, no my team found")
        return True

    for element in general_info["elements"]:
        if element["id"] in my_player_ids:
            if element["status"] != "a":
                logger.info(f"Player {element['first_name']} {element['second_name']} is not available")

    end_time = datetime.now()
    duration = end_time - start_time
    logger.info(f"Manager task completed in {duration.total_seconds():.2f} seconds")