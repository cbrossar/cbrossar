from db import get_session
from logger import logger
from fpl import get_current_season, get_fpl_general_info
from models import FantasyPlayers, FantasyPlayerGameweeks

def __main__():

    logger.info("Starting last 5 points task")

    season = get_current_season()

    if season is None:
        logger.error("No season found")
        return

    data = get_fpl_general_info()

    store_last_5_points(data, season)

    logger.info("Last 5 points task completed")
def store_last_5_points(data, season):
    session = get_session()

    players_to_update = []
    players = session.query(FantasyPlayers).all()

    for player in players:
        logger.info(f"Updating last 5 points for {player.first_name} {player.second_name}")
        gameweeks = session.query(FantasyPlayerGameweeks).filter(FantasyPlayerGameweeks.player_id == player.id, FantasyPlayerGameweeks.season_id == season.id).order_by(FantasyPlayerGameweeks.round.desc()).limit(5).all()

        last_5_points = 0
        for gameweek in gameweeks:
            last_5_points += gameweek.total_points

        player.last_5_points = last_5_points

        players_to_update.append(player)

    session.bulk_save_objects(players_to_update)
    session.commit()

    session.close()

        
if __name__ == "__main__":
    __main__()