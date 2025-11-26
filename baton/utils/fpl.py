from db import Session
from logger import logger
from models import FantasySeasons, FantasyTeams, FantasyPlayers
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
        season = (
            session.query(FantasySeasons)
            .filter(
                FantasySeasons.start_date <= datetime.now(),
                FantasySeasons.end_date + timedelta(days=14) >= datetime.now(),
            )
            .first()
        )

        if not season:
            logger.error("No season found")
            return None

        logger.info(f"Season: {season.name}")
        return season


def get_fpl_general_info():
    general_info_url = "https://fantasy.premierleague.com/api/bootstrap-static/"

    response = requests.get(general_info_url)
    if response.status_code != 200:
        logger.error(f"Failed to fetch data: {response.status_code}")
        return None
    return response.json()


def get_fixtures():
    fixtures_url = "https://fantasy.premierleague.com/api/fixtures/"
    response = requests.get(fixtures_url)
    if response.status_code != 200:
        logger.error(f"Failed to fetch data: {response.status_code}")
        return None
    return response.json()


def get_fixtures_for_team(team_id):
    fixtures = get_fixtures()
    return [
        fixture
        for fixture in fixtures
        if fixture["team_h"] == team_id or fixture["team_a"] == team_id
    ]


def get_fpl_teams(season_id):
    with Session() as session:
        teams = (
            session.query(FantasyTeams)
            .filter(FantasyTeams.season_id == season_id)
            .all()
        )
        return teams


def get_players(season_id):
    with Session() as session:
        players = session.query(FantasyPlayers).filter(FantasyPlayers.season_id == season_id).all()
        return players


def get_my_team(event_id):
    manager_id = "2287765"

    my_team_url = f"https://fantasy.premierleague.com/api/entry/{manager_id}/event/{event_id}/picks/"
    response = requests.get(my_team_url)
    if response.status_code != 200:
        logger.error(f"Failed to fetch data: {response.status_code}")
        return None
    return response.json()
