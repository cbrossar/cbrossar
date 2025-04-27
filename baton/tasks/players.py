from db import get_session
from logger import logger
from models import FantasyPlayers, FantasyPlayerGameweeks
from fpl import get_current_season, get_fpl_general_info

def __main__():

    data = get_fpl_general_info()

    update_players(data)


def update_players(data):
    session = get_session()

    players = session.query(FantasyPlayers).all()

    for element in data["elements"]:
        player = next((p for p in players if p.id == element["id"]), None)
        if player is None:
            continue

    session.close()