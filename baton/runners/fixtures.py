from logger import logger
from utils.fpl import get_fixtures, get_current_season
from sqlalchemy.dialects.postgresql import insert
from db import Session
from models import FantasyPremFixtures, FantasyTeams


def run_fixtures():
    logger.info("Running fixtures update")

    season = get_current_season()

    if not season:
        logger.error("Not updating fixtures, no season found")
        return True

    with Session() as session:
        teams = (
            session.query(FantasyTeams).filter(FantasyTeams.fpl_id.isnot(None)).all()
        )
    teams_map = {team.fpl_id: team for team in teams}
    fixtures = get_fixtures()

    fixture_dicts = []
    for fixture in fixtures:
        fixture_dicts.append(
            {
                "fpl_id": fixture["id"],
                "event": fixture["event"],
                "finished": fixture["finished"],
                "finished_provisional": fixture["finished_provisional"],
                "kickoff_time": fixture["kickoff_time"],
                "minutes": fixture["minutes"],
                "provisional_start_time": fixture["provisional_start_time"],
                "started": fixture["started"],
                "team_a_difficulty": fixture["team_a_difficulty"],
                "team_a_id": teams_map[fixture["team_a"]].id,
                "team_a_score": fixture["team_a_score"],
                "team_h_id": teams_map[fixture["team_h"]].id,
                "team_h_score": fixture["team_h_score"],
                "team_h_difficulty": fixture["team_h_difficulty"],
                "season_id": season.id,
            }
        )

    with Session() as session:
        stmt = insert(FantasyPremFixtures).values(fixture_dicts)
        update_columns = {
            col.name: getattr(stmt.excluded, col.name)
            for col in FantasyPremFixtures.__table__.columns
        }
        stmt = stmt.on_conflict_do_update(
            index_elements=["fpl_id", "season_id"], set_=update_columns
        )
        session.execute(stmt)
        session.commit()
