from db import Session
from logger import logger
from fpl import get_current_season
from models import FantasyPlayers, FantasyPlayerGameweeks
from datetime import datetime


def run_last_5_points():
    logger.info("Starting last 5 points task")
    start_time = datetime.now()

    season = get_current_season()

    if season is None:
        logger.info("Not updating last 5 points, no season found")
        return True

    store_last_5_points(season)

    end_time = datetime.now()
    duration = end_time - start_time
    logger.info(
        f"Last 5 points task completed in {duration.total_seconds():.2f} seconds"
    )
    return True


def store_last_5_points(season):
    highest_last_5_points = 0

    with Session() as session:
        # Preload all relevant gameweeks and group by player_id
        gameweeks = (
            session.query(
                FantasyPlayerGameweeks.player_id, FantasyPlayerGameweeks.total_points
            )
            .filter(FantasyPlayerGameweeks.season_id == season.id)
            .order_by(
                FantasyPlayerGameweeks.player_id, FantasyPlayerGameweeks.round.desc()
            )
            .all()
        )

        from collections import defaultdict

        # Accumulate last 5 gameweeks' points per player
        player_points = defaultdict(list)
        for gw in gameweeks:
            if len(player_points[gw.player_id]) < 5:
                player_points[gw.player_id].append(gw.total_points)

        players = session.query(FantasyPlayers).all()
        for player in players:
            last_5_points = sum(player_points.get(player.id, []))
            player.last_5_points = last_5_points
            if last_5_points > highest_last_5_points:
                highest_last_5_points = last_5_points

        logger.info(f"Updating {len(players)} players")
        logger.info(f"Highest last 5 points: {highest_last_5_points}")

        with Session.begin() as update_session:
            update_session.bulk_save_objects(players)


if __name__ == "__main__":
    run_last_5_points()
