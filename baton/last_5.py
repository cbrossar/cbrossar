from db import get_session
from logger import logger
from fpl import get_current_season, get_fpl_general_info
from models import FantasyPlayers, FantasyPlayerGameweeks

def __main__():

    season = get_current_season()

    if season is None:
        logger.error("No season found")
        return

    data = get_fpl_general_info()

    store_last_5_points(data, season)


def store_last_5_points(data, season):
    session = get_session()

    players_to_update = []
    players = session.query(FantasyPlayers).all()

    for player in players:
        gameweeks = session.query(FantasyPlayerGameweeks).filter(FantasyPlayerGameweeks.player_id == player.id, FantasyPlayerGameweeks.season_id == season.id).order_by(FantasyPlayerGameweeks.round.desc()).limit(5).all()

        if (player.id == 541):
            logger.info(gameweeks)
            break
        last_5_points = 0
        for gameweek in gameweeks:
            last_5_points += gameweek.total_points

        player.last_5_points = last_5_points

    #     players_to_update.append(player)

    # session.bulk_save_objects(players_to_update)
    # session.commit()

    # session.close()

        
if __name__ == "__main__":
    __main__()