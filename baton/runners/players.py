from db import Session
from sqlalchemy.dialects.postgresql import insert
from logger import logger
from models import FantasyPlayers, FantasyPremUpdates
from utils.fpl import (
    get_fpl_general_info,
    get_current_season,
    get_fpl_teams,
    get_my_team,
    get_players,
)
from utils.telegram import send_telegram_message, Channel
from datetime import datetime
from enum import Enum


class PlayerStatus(Enum):
    AVAILABLE = "a"
    INJURED = "i"
    DOUBTFUL = "d"
    SUSPENDED = "s"
    UNAVAILABLE = "u"

    def __str__(self):
        return self.name.capitalize()


def run_update_players():

    logger.info("Starting update players")

    start_time = datetime.now()

    data = get_fpl_general_info()

    season = get_current_season()

    if season is None:
        logger.info("Not updating players, no season found")
        return True

    current_gameweek = None
    for event in data["events"]:
        if event["is_current"]:
            current_gameweek = event["id"]

    my_team = get_my_team(current_gameweek)

    if my_team is None:
        logger.info("Not updating players, no my team found")
        return True

    teams = get_fpl_teams(season.id)
    players = get_players()

    update_players(data, season, teams, players, my_team)

    end_time = datetime.now()
    duration = end_time - start_time

    logger.info(f"Update players completed in {duration.total_seconds():.2f} seconds")

    return True


def update_players(data, season, teams, players, my_team):

    player_dicts = []

    team_map = {team.fpl_id: team for team in teams}
    player_map = {player.fpl_id: player for player in players}
    my_player_ids = [pick["element"] for pick in my_team["picks"]]

    for element in data["elements"]:

        if element["id"] in my_player_ids:

            player_status_became_unavailable = (
                element["status"] != PlayerStatus.AVAILABLE.value
                and player_map[element["id"]].status == PlayerStatus.AVAILABLE.value
            )
            if player_status_became_unavailable:
                send_telegram_message(
                    f"⚠️ Player {element['first_name']} {element['second_name']} is {PlayerStatus(element['status'])}",
                    Channel.FANTASY_PREM,
                )

        player_dicts.append(
            {
                "fpl_id": element["id"],
                "first_name": element["first_name"],
                "second_name": element["second_name"],
                "team": element["team"],
                "team_id": team_map[element["team"]].id,
                "element_type": element["element_type"],
                "cost_change_start": element["cost_change_start"],
                "now_cost": element["now_cost"],
                "total_points": element["total_points"],
                "event_points": element["event_points"],
                "minutes": element["minutes"],
                "goals_scored": element["goals_scored"],
                "assists": element["assists"],
                "clean_sheets": element["clean_sheets"],
                "expected_goals": element["expected_goals"],
                "expected_assists": element["expected_assists"],
                "transfers_in": element["transfers_in"],
                "transfers_in_event": element["transfers_in_event"],
                "season_id": season.id,
                "status": element["status"],
            }
        )

    with Session() as session:
        stmt = insert(FantasyPlayers).values(player_dicts)
        update_columns = {
            col.name: getattr(stmt.excluded, col.name)
            for col in FantasyPlayers.__table__.columns
            if col.name not in ["id", "fdr_5", "last_5_points"]
        }  # exclude PK and calculated fields
        stmt = stmt.on_conflict_do_update(
            index_elements=["fpl_id", "season_id"], set_=update_columns
        )
        session.execute(stmt)
        session.add(FantasyPremUpdates())
        session.commit()
