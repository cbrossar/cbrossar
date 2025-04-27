from db import get_session
from logger import logger
from models import FantasyPlayers
import requests


def __main__():
    session = get_session()

    # TODO: Get season based on current date



    data = get_fpl_general_info()
    logger.info(f"data keys: {data.keys()}")

    # Loop over players
    fpl_player_types = [0,1,2,3]
    for element in data["elements"]:
        if element["element_type"] not in fpl_player_types:
            continue

        if element["second_name"] == "Maddison":

            # TODO: join with gameweeks table filtered by season
            player = session.query(FantasyPlayers).filter(FantasyPlayers.id == element["id"]).first()
            if player is None:
                logger.info(f"Player not found: {element['second_name']}")
                continue
            logger.info(f"Player found: {player.first_name} {player.second_name}")

            fpl_player = get_fpl_player(element["id"])
            history = fpl_player['history']
            current_gameweek = history[-1]
            logger.info(f"current_gameweek: {current_gameweek}")

            # TODO: store each game in db if not there
            break

    session.close()

def get_fpl_general_info():
    general_info_url = "https://fantasy.premierleague.com/api/bootstrap-static/"

    response = requests.get(general_info_url)
    if response.status_code != 200:
        logger.error(f"Failed to fetch data: {response.status_code}")
        return None
    return response.json()


def get_fpl_player(element_id):
    player_url = f"https://fantasy.premierleague.com/api/element-summary/{element_id}/"
    response = requests.get(player_url)
    if response.status_code != 200:
        logger.error(f"Failed to fetch data: {response.status_code}")
        return None
    return response.json()

if __name__ == "__main__":
    __main__()