from utils.fpl import get_fpl_general_info, get_current_season
from models import FantasySeasons, FantasyTeams
from db import Session
from logger import logger


def run_teams():

    fpl_general_info = get_fpl_general_info()
    season = get_current_season()
    fpl_teams = fpl_general_info["teams"]

    with Session() as session:

        for fpl_team in fpl_teams:
            team_name = fpl_team["name"]
            team_id = fpl_team["id"]

            team = (
                session.query(FantasyTeams)
                .filter(
                    FantasyTeams.name == team_name, FantasyTeams.season_id == season.id
                )
                .first()
            )
            if team:
                if team.fpl_id == team_id:
                    continue

                team.fpl_id = team_id
                logger.info(
                    f"Updated team {team_name} with FPL ID {team_id}, id {team.id}"
                )
            else:
                # reuse the logo from the most recent season this team appeared in
                previous_team = (
                    session.query(FantasyTeams)
                    .join(FantasySeasons, FantasyTeams.season_id == FantasySeasons.id)
                    .filter(
                        FantasyTeams.name == team_name,
                        FantasyTeams.image_filename.isnot(None),
                    )
                    .order_by(FantasySeasons.start_date.desc())
                    .first()
                )
                team = FantasyTeams(
                    name=team_name,
                    fpl_id=team_id,
                    season_id=season.id,
                    image_filename=previous_team.image_filename if previous_team else None,
                )
                if previous_team is None:
                    logger.warning(f"No logo found for new team {team_name}")
                logger.info(
                    f"Created team {team_name} with FPL ID {team_id}, id {team.id}"
                )

            session.add(team)

        session.commit()

    return True
