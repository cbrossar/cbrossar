from collections import defaultdict
from datetime import datetime

from db import Session
from logger import logger
from models import FantasyPlayers, FantasyPlayerGameweeks
from utils.fpl import get_current_season, get_fpl_general_info, get_fpl_player


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
    player_gameweeks_to_add = []
    with Session.begin() as session:
        players = (
            session.query(FantasyPlayers)
            .filter(
                FantasyPlayers.season_id == season.id,
                FantasyPlayers.element_type.in_(fpl_player_types),
            )
            .all()
        )
        player_ids = [player.id for player in players]
        existing_gameweeks = (
            session.query(FantasyPlayerGameweeks)
            .filter(
                FantasyPlayerGameweeks.season_id == season.id,
                FantasyPlayerGameweeks.player_id.in_(player_ids),
            )
            .all()
        )

        completed_gameweeks_by_player = defaultdict(dict)
        for gameweek in existing_gameweeks:
            completed_gameweeks_by_player[gameweek.player_id][
                (gameweek.round, gameweek.fixture, gameweek.opponent_team)
            ] = gameweek

        for player in players:
            fpl_player = get_fpl_player(player.fpl_id)
            if fpl_player is None:
                logger.error(
                    f"Failed to fetch FPL data for player {player.second_name}"
                )
                continue

            completed_gameweeks = completed_gameweeks_by_player.get(player.id, {})

            # sum fixture difficulty for next 5 fixtures
            player.fdr_5 = sum(f["difficulty"] for f in fpl_player["fixtures"][:5])

            fpl_player_gameweek_history = fpl_player["history"]

            for fpl_player_gameweek in fpl_player_gameweek_history:
                gameweek_key = (
                    fpl_player_gameweek["round"],
                    fpl_player_gameweek["fixture"],
                    fpl_player_gameweek["opponent_team"],
                )

                # if the gameweek is already in the database, check if the total points are different
                existing_gameweek = completed_gameweeks.get(gameweek_key)
                if existing_gameweek is not None:
                    if (
                        fpl_player_gameweek["total_points"]
                        == existing_gameweek.total_points
                    ):
                        continue
                    logger.info(
                        f"Deleting gameweek {gameweek_key} for player {player.first_name} {player.second_name}"
                    )
                    session.delete(existing_gameweek)

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

        if player_gameweeks_to_add:
            logger.info(f"Adding {len(player_gameweeks_to_add)} player gameweeks")
            session.bulk_save_objects(player_gameweeks_to_add)


def fetch_player(player_id):
    with Session() as session:
        player = (
            session.query(FantasyPlayers)
            .filter(FantasyPlayers.fpl_id == player_id)
            .first()
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
