from db import Session
from logger import logger
from models import FantasyPlayers, FantasyPlayerGameweeks
from fpl import get_current_season, get_fpl_general_info, get_fpl_player
from datetime import datetime


def run_player_gameweeks():
    logger.info("Starting player gameweeks task")
    start_time = datetime.now()

    season = get_current_season()

    if season is None:
        logger.info("Not updating player gameweeks, no season found")
        return True

    data = get_fpl_general_info()

    store_fpl_player_gameweeks(data, season)

    end_time = datetime.now()
    duration = end_time - start_time
    logger.info(
        f"Player gameweeks task completed in {duration.total_seconds():.2f} seconds"
    )
    return True


def store_fpl_player_gameweeks(data, season):
    fpl_player_types = [1, 2, 3, 4]
    players_fdr_5_updated = []
    player_gameweeks_to_add = []

    for element in data["elements"]:
        if element["element_type"] not in fpl_player_types:
            continue

        try:
            player = fetch_player(element["id"])

            if player is None:
                logger.info(f"Player not found: {element['second_name']}")
                continue

            gameweeks = fetch_player_gameweeks(player.id, season.id)

            completed_gameweeks = set(
                [
                    (gameweek.round, gameweek.fixture, gameweek.opponent_team)
                    for gameweek in gameweeks
                ]
            )

            fpl_player = get_fpl_player(element["id"])
            if fpl_player is None:
                logger.error(
                    f"Failed to fetch FPL data for player {element['second_name']}"
                )
                continue

            # sum fixture difficulty for next 5 fixtures
            player.fdr_5 = sum(f["difficulty"] for f in fpl_player["fixtures"][:5])
            players_fdr_5_updated.append(player)

            fpl_player_gameweek_history = fpl_player["history"]

            for fpl_player_gameweek in fpl_player_gameweek_history:
                gameweek_key = (
                    fpl_player_gameweek["round"],
                    fpl_player_gameweek["fixture"],
                    fpl_player_gameweek["opponent_team"],
                )
                if gameweek_key in completed_gameweeks:
                    continue

                player_gameweek = FantasyPlayerGameweeks(
                    player_id=player.id,
                    season_id=season.id,
                    round=fpl_player_gameweek["round"],
                    fixture=fpl_player_gameweek["fixture"],
                    opponent_team=fpl_player_gameweek["opponent_team"],
                    total_points=fpl_player_gameweek["total_points"],
                    minutes=fpl_player_gameweek["minutes"],
                    goals_scored=fpl_player_gameweek["goals_scored"],
                    assists=fpl_player_gameweek["assists"],
                    clean_sheets=fpl_player_gameweek["clean_sheets"],
                    bonus=fpl_player_gameweek["bonus"],
                    expected_goals=fpl_player_gameweek["expected_goals"],
                    expected_assists=fpl_player_gameweek["expected_assists"],
                    transfers_in=fpl_player_gameweek["transfers_in"],
                    transfers_out=fpl_player_gameweek["transfers_out"],
                )
                player_gameweeks_to_add.append(player_gameweek)

        except Exception as e:
            logger.error(
                f"Error processing player {element.get('second_name', '')}: {str(e)}"
            )
            continue

    # Bulk insert all gameweeks at once
    if player_gameweeks_to_add:
        with Session.begin() as session:
            logger.info(f"Adding {len(player_gameweeks_to_add)} player gameweeks")
            session.bulk_save_objects(player_gameweeks_to_add)

    if players_fdr_5_updated:
        with Session.begin() as session:
            logger.info(f"Updating {len(players_fdr_5_updated)} player FDR5")
            session.bulk_save_objects(players_fdr_5_updated)


def fetch_player(player_id):
    with Session() as session:
        player = (
            session.query(FantasyPlayers).filter(FantasyPlayers.id == player_id).first()
        )
        return player


def fetch_player_gameweeks(player_id, season_id):
    with Session() as session:
        gameweeks = (
            session.query(FantasyPlayerGameweeks)
            .filter(
                FantasyPlayerGameweeks.player_id == player_id,
                FantasyPlayerGameweeks.season_id == season_id,
            )
            .all()
        )
        return gameweeks


if __name__ == "__main__":
    run_player_gameweeks()
