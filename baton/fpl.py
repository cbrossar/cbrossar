from db import Session
from logger import logger
from models import FantasySeasons
import requests
from datetime import datetime, timedelta

def get_fpl_player(element_id):
    player_url = f"https://fantasy.premierleague.com/api/element-summary/{element_id}/"
    response = requests.get(player_url)
    if response.status_code != 200:
        logger.error(f"Failed to fetch data: {response.status_code}")
        return None
    return response.json()


def get_current_season():
    with Session() as session:
        season = session.query(FantasySeasons).filter(FantasySeasons.start_date <= datetime.now(), FantasySeasons.end_date + timedelta(days=14) >= datetime.now()).first()
        logger.info(f"Season: {season.name}")
        return season

def get_fpl_general_info():
    general_info_url = "https://fantasy.premierleague.com/api/bootstrap-static/"

    response = requests.get(general_info_url)
    if response.status_code != 200:
        logger.error(f"Failed to fetch data: {response.status_code}")
        return None
    return response.json()