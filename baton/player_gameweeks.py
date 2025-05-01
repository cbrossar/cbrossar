from db import get_session
from logger import logger
from models import FantasyPlayers, FantasyPlayerGameweeks
from fpl import get_current_season, get_fpl_general_info, get_fpl_player
from datetime import datetime
def __main__():

    logger.info("Starting player gameweeks task")
    start_time = datetime.now()

    season = get_current_season()

    if season is None:
        logger.error("No season found")
        return

    data = get_fpl_general_info()

    store_fpl_player_gameweeks(data, season)

    end_time = datetime.now()
    duration = end_time - start_time
    logger.info(f"Player gameweeks task completed in {duration.total_seconds():.2f} seconds")

    
def store_fpl_player_gameweeks(data, season):
    session = get_session()

    fpl_player_types = [1,2,3,4]
    player_gameweeks_to_add = []
    
    for element in data["elements"]:

        if element["element_type"] not in fpl_player_types:
            continue

        player = session.query(FantasyPlayers).filter(FantasyPlayers.id == element["id"]).first()
        if player is None:
            logger.info(f"Player not found: {element['second_name']}")
            continue
        
        gameweeks = session.query(FantasyPlayerGameweeks).filter(FantasyPlayerGameweeks.player_id == player.id, FantasyPlayerGameweeks.season_id == season.id).all()

        completed_gameweeks = set([(gameweek.round, gameweek.fixture, gameweek.opponent_team) for gameweek in gameweeks])

        fpl_player = get_fpl_player(element["id"])
        fpl_player_gameweek_history = fpl_player['history']
        
        for fpl_player_gameweek in fpl_player_gameweek_history:
            gameweek_key = (fpl_player_gameweek['round'], fpl_player_gameweek['fixture'], fpl_player_gameweek['opponent_team'])
            if gameweek_key in completed_gameweeks:
                continue

            player_gameweek = FantasyPlayerGameweeks(
                player_id=player.id,
                season_id=season.id,
                round=fpl_player_gameweek['round'],
                fixture=fpl_player_gameweek['fixture'],
                opponent_team=fpl_player_gameweek['opponent_team'],
                total_points=fpl_player_gameweek['total_points'],
                minutes=fpl_player_gameweek['minutes'],
                goals_scored=fpl_player_gameweek['goals_scored'],
                assists=fpl_player_gameweek['assists'],
                clean_sheets=fpl_player_gameweek['clean_sheets'],
                bonus=fpl_player_gameweek['bonus'],
                expected_goals=fpl_player_gameweek['expected_goals'],
                expected_assists=fpl_player_gameweek['expected_assists'],
                transfers_in=fpl_player_gameweek['transfers_in'],
                transfers_out=fpl_player_gameweek['transfers_out'],
            )
            player_gameweeks_to_add.append(player_gameweek)

    # Bulk insert all gameweeks at once
    if player_gameweeks_to_add:
        logger.info(f"Adding {len(player_gameweeks_to_add)} player gameweeks")
        session.bulk_save_objects(player_gameweeks_to_add)
        session.commit()
    
    session.close()

if __name__ == "__main__":
    __main__()