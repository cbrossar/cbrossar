from db import get_session
from logger import logger
from models import FantasyPlayers, FantasySeasons, FantasyPlayerGameweeks
import requests
from datetime import datetime, timedelta

def __main__():

    season = get_current_season()

    if season is None:
        logger.error("No season found")
        return

    data = get_fpl_general_info()

    store_fpl_player_data(data, season)

    

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


def get_current_season():
    session = get_session()
    season = session.query(FantasySeasons).filter(FantasySeasons.start_date <= datetime.now(), FantasySeasons.end_date + timedelta(days=14) >= datetime.now()).first()
    logger.info(f"Season: {season.name}")
    session.close()
    return season



def store_fpl_player_data(data, season):
    session = get_session()

    fpl_player_types = [0,1,2,3]
    gameweeks_to_add = []
    
    for element in data["elements"]:
        if element["element_type"] not in fpl_player_types:
            continue

        player = session.query(FantasyPlayers).filter(FantasyPlayers.id == element["id"]).first()
        if player is None:
            logger.info(f"Player not found: {element['second_name']}")
            continue
        logger.info(f"Player found: {player.first_name} {player.second_name}")
        
        gameweeks = session.query(FantasyPlayerGameweeks).filter(FantasyPlayerGameweeks.player_id == player.id, FantasyPlayerGameweeks.season_id == season.id).all()

        completed_gameweeks = set([gameweek.round for gameweek in gameweeks])

        fpl_player = get_fpl_player(element["id"])
        fpl_gameweek_history = fpl_player['history']
        
        for fpl_gameweek in fpl_gameweek_history:
            if fpl_gameweek['round'] in completed_gameweeks:
                continue

            gameweek = FantasyPlayerGameweeks(
                player_id=player.id,
                season_id=season.id,
                round=fpl_gameweek['round'],
                fixture=fpl_gameweek['fixture'],
                opponent_team=fpl_gameweek['opponent_team'],
                total_points=fpl_gameweek['total_points'],
                minutes=fpl_gameweek['minutes'],
                goals_scored=fpl_gameweek['goals_scored'],
                assists=fpl_gameweek['assists'],
                clean_sheets=fpl_gameweek['clean_sheets'],
                bonus=fpl_gameweek['bonus'],
                expected_goals=fpl_gameweek['expected_goals'],
                expected_assists=fpl_gameweek['expected_assists'],
                transfers_in=fpl_gameweek['transfers_in'],
                transfers_out=fpl_gameweek['transfers_out'],
            )
            gameweeks_to_add.append(gameweek)

    # Bulk insert all gameweeks at once
    if gameweeks_to_add:
        session.bulk_save_objects(gameweeks_to_add)
        session.commit()
    
    session.close()

if __name__ == "__main__":
    __main__()