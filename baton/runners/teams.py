from utils.fpl import get_fpl_general_info
from models import FantasyTeams
from db import Session
from logger import logger


def run_teams():

    fpl_general_info = get_fpl_general_info()
    fpl_teams = fpl_general_info["teams"]

    with Session() as session:

        for fpl_team in fpl_teams:
            team_name = fpl_team["name"]
            team_id = fpl_team["id"]

            team = (
                session.query(FantasyTeams)
                .filter(FantasyTeams.name == team_name)
                .first()
            )

            if team:
                team.fpl_id = team_id
                logger.info(
                    f"Updated team {team_name} with FPL ID {team_id}, id {team.id}"
                )
            else:
                team = FantasyTeams(
                    name=team_name,
                    fpl_id=team_id,
                )
                logger.info(
                    f"Created team {team_name} with FPL ID {team_id}, id {team.id}"
                )

            session.add(team)

        session.commit()

    return True
