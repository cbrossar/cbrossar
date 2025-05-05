from db import get_session
from logger import logger
from fpl import get_current_season
from models import FantasyPlayers, FantasyPlayerGameweeks
from datetime import datetime

def run_last_5_points():
    logger.info("Starting last 5 points task")
    start_time = datetime.now()

    season = get_current_season()

    if season is None:
        logger.error("No season found")
        return False

    store_last_5_points(season)

    end_time = datetime.now()
    duration = end_time - start_time
    logger.info(f"Last 5 points task completed in {duration.total_seconds():.2f} seconds")
    return True

def __main__():
    run_last_5_points()

def store_last_5_points(season):
    session = get_session()

    players_to_update = []
    players = session.query(FantasyPlayers).all()

    highest_last_5_points = 0

    for player in players:
        gameweeks = session.query(FantasyPlayerGameweeks).filter(FantasyPlayerGameweeks.player_id == player.id, FantasyPlayerGameweeks.season_id == season.id).order_by(FantasyPlayerGameweeks.round.desc()).limit(5).all()

        last_5_points = 0
        for gameweek in gameweeks:
            last_5_points += gameweek.total_points

        player.last_5_points = last_5_points

        if last_5_points > highest_last_5_points:
            highest_last_5_points = last_5_points

        players_to_update.append(player)

    logger.info(f"Updating {len(players_to_update)} players")
    logger.info(f"Highest last 5 points: {highest_last_5_points}")
    session.bulk_save_objects(players_to_update)
    session.commit()

    session.close()

if __name__ == "__main__":
    __main__()