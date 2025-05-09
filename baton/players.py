from db import Session
from logger import logger
from models import FantasyPlayers
from fpl import get_fpl_general_info
from datetime import datetime

def run_update_players():

    logger.info("Starting update players")

    start_time = datetime.now()

    data = get_fpl_general_info()

    update_players(data)    

    end_time = datetime.now()
    duration = end_time - start_time

    logger.info(f"Update players completed in {duration.total_seconds():.2f} seconds")

    return True


def update_players(data):

    players_to_upsert = []

    for element in data["elements"]:

        player = FantasyPlayers(
            id=element["id"],
            first_name=element["first_name"],
            second_name=element["second_name"],
            team=element["team"],
            element_type=element["element_type"],
            cost_change_start=element["cost_change_start"],
            now_cost=element["now_cost"],
            total_points=element["total_points"],
            event_points=element["event_points"],
            minutes=element["minutes"],
            goals_scored=element["goals_scored"],
            assists=element["assists"],
            clean_sheets=element["clean_sheets"],
            expected_goals=element["expected_goals"],
            expected_assists=element["expected_assists"],
            transfers_in=element["transfers_in"],
            transfers_in_event=element["transfers_in_event"],
        )

        players_to_upsert.append(player)

    with Session() as session:
        for player in players_to_upsert:
            session.merge(player)  # Will insert or update based on PK
        session.commit()


if __name__ == "__main__":
    run_update_players()