from typing import List, Optional

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Double,
    ForeignKeyConstraint,
    Integer,
    PrimaryKeyConstraint,
    REAL,
    String,
    Text,
    UniqueConstraint,
    Uuid,
    text,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
import datetime
import uuid


class Base(DeclarativeBase):
    pass


class DoomsdayAttempt(Base):
    __tablename__ = "doomsday_attempt"
    __table_args__ = (PrimaryKeyConstraint("id", name="doomsday_attempt_pkey"),)

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, server_default=text("uuid_generate_v4()")
    )
    correct: Mapped[bool] = mapped_column(Boolean)
    time_taken_ms: Mapped[float] = mapped_column(Double(53))
    streak: Mapped[int] = mapped_column(Integer)
    created: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime, server_default=text("CURRENT_TIMESTAMP")
    )


class FantasyPositions(Base):
    __tablename__ = "fantasy_positions"
    __table_args__ = (PrimaryKeyConstraint("id", name="fantasy_positions_pkey"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    singular_name: Mapped[str] = mapped_column(String(255))
    squad_min_play: Mapped[int] = mapped_column(Integer)
    squad_max_play: Mapped[int] = mapped_column(Integer)

    fantasy_players: Mapped[List["FantasyPlayers"]] = relationship(
        "FantasyPlayers", back_populates="fantasy_positions"
    )


class FantasyPremUpdates(Base):
    __tablename__ = "fantasy_prem_updates"
    __table_args__ = (PrimaryKeyConstraint("id", name="fantasy_prem_updates_pkey"),)

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, server_default=text("uuid_generate_v4()")
    )
    updated: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime(True), server_default=text("CURRENT_TIMESTAMP")
    )


class FantasySeasons(Base):
    __tablename__ = "fantasy_seasons"
    __table_args__ = (
        PrimaryKeyConstraint("id", name="fantasy_seasons_pkey"),
        UniqueConstraint("name", name="fantasy_seasons_name_key"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, server_default=text("uuid_generate_v4()")
    )
    name: Mapped[str] = mapped_column(String(255))
    start_date: Mapped[datetime.date] = mapped_column(Date)
    end_date: Mapped[datetime.date] = mapped_column(Date)

    fantasy_teams: Mapped[List["FantasyTeams"]] = relationship(
        "FantasyTeams", back_populates="season"
    )
    fantasy_players: Mapped[List["FantasyPlayers"]] = relationship(
        "FantasyPlayers", back_populates="season"
    )
    fantasy_prem_fixtures: Mapped[List["FantasyPremFixtures"]] = relationship(
        "FantasyPremFixtures", back_populates="season"
    )
    fantasy_player_gameweeks: Mapped[List["FantasyPlayerGameweeks"]] = relationship(
        "FantasyPlayerGameweeks", back_populates="season"
    )


class MusicReviews(Base):
    __tablename__ = "music_reviews"
    __table_args__ = (PrimaryKeyConstraint("id", name="music_reviews_pkey"),)

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, server_default=text("uuid_generate_v4()")
    )
    album: Mapped[str] = mapped_column(String(255))
    artist: Mapped[str] = mapped_column(String(255))
    rating: Mapped[float] = mapped_column(Double(53))
    image_url: Mapped[str] = mapped_column(String(255))
    created: Mapped[datetime.datetime] = mapped_column(
        DateTime(True), server_default=text("CURRENT_TIMESTAMP")
    )
    review: Mapped[Optional[str]] = mapped_column(Text)
    name: Mapped[Optional[str]] = mapped_column(String(255))
    spotify_album_id: Mapped[Optional[str]] = mapped_column(String(255))


class MusicbrainzReleases(Base):
    __tablename__ = "musicbrainz_releases"
    __table_args__ = (PrimaryKeyConstraint("id", name="musicbrainz_releases_pkey"),)

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    title: Mapped[str] = mapped_column(Text)
    release_date: Mapped[datetime.date] = mapped_column(Date)
    primary_type: Mapped[str] = mapped_column(Text)
    artist_name: Mapped[str] = mapped_column(Text)
    image_url: Mapped[Optional[str]] = mapped_column(Text)
    created: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime, server_default=text("CURRENT_TIMESTAMP")
    )


class PlayingWithNeon(Base):
    __tablename__ = "playing_with_neon"
    __table_args__ = (PrimaryKeyConstraint("id", name="playing_with_neon_pkey"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(Text)
    value: Mapped[Optional[float]] = mapped_column(REAL)


class RedditSpurs(Base):
    __tablename__ = "reddit_spurs"
    __table_args__ = (PrimaryKeyConstraint("id", name="reddit_spurs_pkey"),)

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, server_default=text("uuid_generate_v4()")
    )
    reddit_id: Mapped[str] = mapped_column(String(255))
    title: Mapped[str] = mapped_column(String(512))
    author: Mapped[str] = mapped_column(String(255))
    created_date: Mapped[datetime.datetime] = mapped_column(DateTime)
    url: Mapped[str] = mapped_column(String(255))
    permalink: Mapped[str] = mapped_column(String(255))


class SpotifyReleases(Base):
    __tablename__ = "spotify_releases"
    __table_args__ = (PrimaryKeyConstraint("id", name="spotify_releases_pkey"),)

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    artist_id: Mapped[str] = mapped_column(Text)
    artist_name: Mapped[str] = mapped_column(Text)
    name: Mapped[str] = mapped_column(Text)
    spotify_url: Mapped[str] = mapped_column(Text)
    release_date: Mapped[Optional[datetime.date]] = mapped_column(Date)
    release_date_precision: Mapped[Optional[str]] = mapped_column(Text)
    image_url: Mapped[Optional[str]] = mapped_column(Text)
    notified: Mapped[Optional[bool]] = mapped_column(Boolean)
    created: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime, server_default=text("now()")
    )


class Teams(Base):
    __tablename__ = "teams"
    __table_args__ = (
        PrimaryKeyConstraint("id", name="teams_pkey"),
        UniqueConstraint("name", name="teams_name_key"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, server_default=text("uuid_generate_v4()")
    )
    name: Mapped[str] = mapped_column(String(255))
    image_filename: Mapped[Optional[str]] = mapped_column(String(255))
    created: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime, server_default=text("CURRENT_TIMESTAMP")
    )

    matches: Mapped[List["Matches"]] = relationship(
        "Matches", foreign_keys="[Matches.away_team_id]", back_populates="away_team"
    )
    matches_: Mapped[List["Matches"]] = relationship(
        "Matches", foreign_keys="[Matches.home_team_id]", back_populates="home_team"
    )


class VivinoGrapes(Base):
    __tablename__ = "vivino_grapes"
    __table_args__ = (PrimaryKeyConstraint("id", name="vivino_grapes_pkey"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255))

    vivino_countries: Mapped[List["VivinoCountries"]] = relationship(
        "VivinoCountries",
        foreign_keys="[VivinoCountries.grape1_id]",
        back_populates="grape1",
    )
    vivino_countries_: Mapped[List["VivinoCountries"]] = relationship(
        "VivinoCountries",
        foreign_keys="[VivinoCountries.grape2_id]",
        back_populates="grape2",
    )
    vivino_countries1: Mapped[List["VivinoCountries"]] = relationship(
        "VivinoCountries",
        foreign_keys="[VivinoCountries.grape3_id]",
        back_populates="grape3",
    )


class VivinoWineries(Base):
    __tablename__ = "vivino_wineries"
    __table_args__ = (PrimaryKeyConstraint("id", name="vivino_wineries_pkey"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255))

    vivino_wines: Mapped[List["VivinoWines"]] = relationship(
        "VivinoWines", back_populates="winery"
    )


class FantasyTeams(Base):
    __tablename__ = "fantasy_teams"
    __table_args__ = (
        ForeignKeyConstraint(["season_id"], ["fantasy_seasons.id"], name="season_fk"),
        PrimaryKeyConstraint("id", name="fantasy_teams_pkey"),
        UniqueConstraint("fpl_id", "season_id", name="unique_fpl_season_id"),
    )

    name: Mapped[str] = mapped_column(String(255))
    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, server_default=text("gen_random_uuid()")
    )
    image_filename: Mapped[Optional[str]] = mapped_column(String(255))
    fpl_id: Mapped[Optional[int]] = mapped_column(Integer)
    season_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid)

    season: Mapped[Optional["FantasySeasons"]] = relationship(
        "FantasySeasons", back_populates="fantasy_teams"
    )
    fantasy_players: Mapped[List["FantasyPlayers"]] = relationship(
        "FantasyPlayers", back_populates="team_"
    )
    fantasy_prem_fixtures: Mapped[List["FantasyPremFixtures"]] = relationship(
        "FantasyPremFixtures",
        foreign_keys="[FantasyPremFixtures.team_a_id]",
        back_populates="team_a",
    )
    fantasy_prem_fixtures_: Mapped[List["FantasyPremFixtures"]] = relationship(
        "FantasyPremFixtures",
        foreign_keys="[FantasyPremFixtures.team_h_id]",
        back_populates="team_h",
    )


class Matches(Base):
    __tablename__ = "matches"
    __table_args__ = (
        ForeignKeyConstraint(
            ["away_team_id"], ["teams.id"], name="matches_away_team_id_fkey"
        ),
        ForeignKeyConstraint(
            ["home_team_id"], ["teams.id"], name="matches_home_team_id_fkey"
        ),
        PrimaryKeyConstraint("id", name="matches_pkey"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, server_default=text("uuid_generate_v4()")
    )
    home_team_id: Mapped[uuid.UUID] = mapped_column(Uuid)
    away_team_id: Mapped[uuid.UUID] = mapped_column(Uuid)
    home_score: Mapped[int] = mapped_column(Integer)
    away_score: Mapped[int] = mapped_column(Integer)
    date: Mapped[datetime.date] = mapped_column(Date)
    created: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime, server_default=text("CURRENT_TIMESTAMP")
    )

    away_team: Mapped["Teams"] = relationship(
        "Teams", foreign_keys=[away_team_id], back_populates="matches"
    )
    home_team: Mapped["Teams"] = relationship(
        "Teams", foreign_keys=[home_team_id], back_populates="matches_"
    )
    match_updates: Mapped[List["MatchUpdates"]] = relationship(
        "MatchUpdates", back_populates="match"
    )


class VivinoCountries(Base):
    __tablename__ = "vivino_countries"
    __table_args__ = (
        ForeignKeyConstraint(
            ["grape1_id"], ["vivino_grapes.id"], name="vivino_countries_grape1_id_fkey"
        ),
        ForeignKeyConstraint(
            ["grape2_id"], ["vivino_grapes.id"], name="vivino_countries_grape2_id_fkey"
        ),
        ForeignKeyConstraint(
            ["grape3_id"], ["vivino_grapes.id"], name="vivino_countries_grape3_id_fkey"
        ),
        PrimaryKeyConstraint("code", name="vivino_countries_pkey"),
    )

    code: Mapped[str] = mapped_column(String(4), primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    wines_count: Mapped[int] = mapped_column(Integer)
    wineries_count: Mapped[int] = mapped_column(Integer)
    grape1_id: Mapped[Optional[int]] = mapped_column(Integer)
    grape2_id: Mapped[Optional[int]] = mapped_column(Integer)
    grape3_id: Mapped[Optional[int]] = mapped_column(Integer)

    grape1: Mapped[Optional["VivinoGrapes"]] = relationship(
        "VivinoGrapes", foreign_keys=[grape1_id], back_populates="vivino_countries"
    )
    grape2: Mapped[Optional["VivinoGrapes"]] = relationship(
        "VivinoGrapes", foreign_keys=[grape2_id], back_populates="vivino_countries_"
    )
    grape3: Mapped[Optional["VivinoGrapes"]] = relationship(
        "VivinoGrapes", foreign_keys=[grape3_id], back_populates="vivino_countries1"
    )
    vivino_regions: Mapped[List["VivinoRegions"]] = relationship(
        "VivinoRegions", back_populates="vivino_countries"
    )


class FantasyPlayers(Base):
    __tablename__ = "fantasy_players"
    __table_args__ = (
        ForeignKeyConstraint(
            ["element_type"],
            ["fantasy_positions.id"],
            name="fantasy_players_element_type_fkey",
        ),
        ForeignKeyConstraint(
            ["season_id"], ["fantasy_seasons.id"], name="fantasy_players_season_fkey"
        ),
        ForeignKeyConstraint(
            ["team_id"], ["fantasy_teams.id"], name="fantasy_players_team_id_fkey"
        ),
        PrimaryKeyConstraint("id", name="fantasy_players_pkey"),
        UniqueConstraint("fpl_id", "season_id", name="unique_fpl_season"),
    )

    fpl_id: Mapped[int] = mapped_column(Integer)
    first_name: Mapped[str] = mapped_column(String(255))
    second_name: Mapped[str] = mapped_column(String(255))
    team: Mapped[int] = mapped_column(Integer)
    element_type: Mapped[int] = mapped_column(Integer)
    cost_change_start: Mapped[float] = mapped_column(Double(53))
    now_cost: Mapped[float] = mapped_column(Double(53))
    total_points: Mapped[int] = mapped_column(Integer)
    event_points: Mapped[int] = mapped_column(Integer)
    minutes: Mapped[int] = mapped_column(Integer)
    goals_scored: Mapped[int] = mapped_column(Integer)
    assists: Mapped[int] = mapped_column(Integer)
    clean_sheets: Mapped[int] = mapped_column(Integer)
    expected_goals: Mapped[float] = mapped_column(Double(53))
    expected_assists: Mapped[float] = mapped_column(Double(53))
    transfers_in: Mapped[int] = mapped_column(Integer)
    transfers_in_event: Mapped[int] = mapped_column(Integer)
    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, server_default=text("uuid_generate_v4()")
    )
    status: Mapped[str] = mapped_column(
        String(1), server_default=text("'a'::character varying")
    )
    fdr_5: Mapped[Optional[int]] = mapped_column(Integer)
    transfer_index: Mapped[Optional[float]] = mapped_column(Double(53))
    last_5_points: Mapped[Optional[int]] = mapped_column(
        Integer, server_default=text("0")
    )
    season_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid)
    team_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid)

    fantasy_positions: Mapped["FantasyPositions"] = relationship(
        "FantasyPositions", back_populates="fantasy_players"
    )
    season: Mapped[Optional["FantasySeasons"]] = relationship(
        "FantasySeasons", back_populates="fantasy_players"
    )
    team_: Mapped[Optional["FantasyTeams"]] = relationship(
        "FantasyTeams", back_populates="fantasy_players"
    )
    fantasy_player_gameweeks: Mapped[List["FantasyPlayerGameweeks"]] = relationship(
        "FantasyPlayerGameweeks", back_populates="player"
    )


class FantasyPremFixtures(Base):
    __tablename__ = "fantasy_prem_fixtures"
    __table_args__ = (
        ForeignKeyConstraint(
            ["season_id"],
            ["fantasy_seasons.id"],
            name="fantasy_prem_fixtures_season_id_fkey",
        ),
        ForeignKeyConstraint(
            ["team_a_id"],
            ["fantasy_teams.id"],
            name="fantasy_prem_fixtures_team_a_id_fkey",
        ),
        ForeignKeyConstraint(
            ["team_h_id"],
            ["fantasy_teams.id"],
            name="fantasy_prem_fixtures_team_h_id_fkey",
        ),
        PrimaryKeyConstraint("id", name="fantasy_prem_fixtures_pkey"),
        UniqueConstraint(
            "fpl_id", "season_id", name="fantasy_prem_fixtures_fpl_id_season_id_key"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, server_default=text("uuid_generate_v4()")
    )
    event: Mapped[Optional[int]] = mapped_column(Integer)
    finished: Mapped[Optional[bool]] = mapped_column(Boolean)
    finished_provisional: Mapped[Optional[bool]] = mapped_column(Boolean)
    fpl_id: Mapped[Optional[int]] = mapped_column(Integer)
    kickoff_time: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(True))
    minutes: Mapped[Optional[int]] = mapped_column(Integer)
    provisional_start_time: Mapped[Optional[bool]] = mapped_column(Boolean)
    started: Mapped[Optional[bool]] = mapped_column(Boolean)
    team_a_difficulty: Mapped[Optional[int]] = mapped_column(Integer)
    team_a_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid)
    team_a_score: Mapped[Optional[int]] = mapped_column(Integer)
    team_h_difficulty: Mapped[Optional[int]] = mapped_column(Integer)
    team_h_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid)
    team_h_score: Mapped[Optional[int]] = mapped_column(Integer)
    season_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid)

    season: Mapped[Optional["FantasySeasons"]] = relationship(
        "FantasySeasons", back_populates="fantasy_prem_fixtures"
    )
    team_a: Mapped[Optional["FantasyTeams"]] = relationship(
        "FantasyTeams", foreign_keys=[team_a_id], back_populates="fantasy_prem_fixtures"
    )
    team_h: Mapped[Optional["FantasyTeams"]] = relationship(
        "FantasyTeams",
        foreign_keys=[team_h_id],
        back_populates="fantasy_prem_fixtures_",
    )


class MatchUpdates(Base):
    __tablename__ = "match_updates"
    __table_args__ = (
        ForeignKeyConstraint(
            ["match_id"], ["matches.id"], name="match_updates_match_id_fkey"
        ),
        PrimaryKeyConstraint("id", name="match_updates_pkey"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, server_default=text("uuid_generate_v4()")
    )
    success: Mapped[bool] = mapped_column(Boolean)
    match_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid)
    created: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime, server_default=text("CURRENT_TIMESTAMP")
    )

    match: Mapped[Optional["Matches"]] = relationship(
        "Matches", back_populates="match_updates"
    )


class VivinoRegions(Base):
    __tablename__ = "vivino_regions"
    __table_args__ = (
        ForeignKeyConstraint(
            ["country_code"],
            ["vivino_countries.code"],
            name="vivino_regions_country_code_fkey",
        ),
        PrimaryKeyConstraint("id", name="vivino_regions_pkey"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    country_code: Mapped[str] = mapped_column(String(4))
    latitude: Mapped[Optional[float]] = mapped_column(Double(53))
    longitude: Mapped[Optional[float]] = mapped_column(Double(53))

    vivino_countries: Mapped["VivinoCountries"] = relationship(
        "VivinoCountries", back_populates="vivino_regions"
    )
    vivino_wines: Mapped[List["VivinoWines"]] = relationship(
        "VivinoWines", back_populates="region"
    )


class FantasyPlayerGameweeks(Base):
    __tablename__ = "fantasy_player_gameweeks"
    __table_args__ = (
        ForeignKeyConstraint(
            ["player_id"],
            ["fantasy_players.id"],
            name="fantasy_player_gameweeks_player_id_fkey",
        ),
        ForeignKeyConstraint(
            ["season_id"],
            ["fantasy_seasons.id"],
            name="fantasy_player_gameweeks_season_id_fkey",
        ),
        PrimaryKeyConstraint("id", name="fantasy_player_gameweeks_pkey"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, server_default=text("uuid_generate_v4()")
    )
    season_id: Mapped[uuid.UUID] = mapped_column(Uuid)
    round: Mapped[int] = mapped_column(Integer)
    fixture: Mapped[int] = mapped_column(Integer)
    opponent_team: Mapped[int] = mapped_column(Integer)
    total_points: Mapped[int] = mapped_column(Integer)
    minutes: Mapped[int] = mapped_column(Integer)
    goals_scored: Mapped[int] = mapped_column(Integer)
    assists: Mapped[int] = mapped_column(Integer)
    clean_sheets: Mapped[int] = mapped_column(Integer)
    bonus: Mapped[int] = mapped_column(Integer)
    expected_goals: Mapped[float] = mapped_column(Double(53))
    expected_assists: Mapped[float] = mapped_column(Double(53))
    transfers_in: Mapped[int] = mapped_column(Integer)
    transfers_out: Mapped[int] = mapped_column(Integer)
    player_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid)

    player: Mapped[Optional["FantasyPlayers"]] = relationship(
        "FantasyPlayers", back_populates="fantasy_player_gameweeks"
    )
    season: Mapped["FantasySeasons"] = relationship(
        "FantasySeasons", back_populates="fantasy_player_gameweeks"
    )


class VivinoWines(Base):
    __tablename__ = "vivino_wines"
    __table_args__ = (
        ForeignKeyConstraint(
            ["region_id"], ["vivino_regions.id"], name="vivino_wines_region_id_fkey"
        ),
        ForeignKeyConstraint(
            ["winery_id"], ["vivino_wineries.id"], name="vivino_wines_winery_id_fkey"
        ),
        PrimaryKeyConstraint("id", name="vivino_wines_pkey"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    region_id: Mapped[int] = mapped_column(Integer)
    winery_id: Mapped[int] = mapped_column(Integer)
    currency_code: Mapped[str] = mapped_column(String(4))
    price: Mapped[float] = mapped_column(Double(53))
    ratings_count: Mapped[Optional[int]] = mapped_column(Integer)
    ratings_average: Mapped[Optional[float]] = mapped_column(Double(53))
    acidity: Mapped[Optional[float]] = mapped_column(Double(53))
    intensity: Mapped[Optional[float]] = mapped_column(Double(53))
    sweetness: Mapped[Optional[float]] = mapped_column(Double(53))
    tannin: Mapped[Optional[float]] = mapped_column(Double(53))

    region: Mapped["VivinoRegions"] = relationship(
        "VivinoRegions", back_populates="vivino_wines"
    )
    winery: Mapped["VivinoWineries"] = relationship(
        "VivinoWineries", back_populates="vivino_wines"
    )
    wine_quiz: Mapped[List["WineQuiz"]] = relationship(
        "WineQuiz", back_populates="wine"
    )


class WineQuiz(Base):
    __tablename__ = "wine_quiz"
    __table_args__ = (
        ForeignKeyConstraint(
            ["wine_id"], ["vivino_wines.id"], name="wine_quiz_wine_id_fkey"
        ),
        PrimaryKeyConstraint("id", name="wine_quiz_pkey"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ip_address: Mapped[str] = mapped_column(String(255))
    wine_id: Mapped[int] = mapped_column(Integer)
    country_code: Mapped[Optional[str]] = mapped_column(String(4))
    region_id: Mapped[Optional[int]] = mapped_column(Integer)
    acidity: Mapped[Optional[float]] = mapped_column(Double(53))
    intensity: Mapped[Optional[float]] = mapped_column(Double(53))
    sweetness: Mapped[Optional[float]] = mapped_column(Double(53))
    tannin: Mapped[Optional[float]] = mapped_column(Double(53))
    cost: Mapped[Optional[float]] = mapped_column(Double(53))
    rating: Mapped[Optional[float]] = mapped_column(Double(53))
    country_score: Mapped[Optional[float]] = mapped_column(Double(53))
    region_score: Mapped[Optional[float]] = mapped_column(Double(53))
    acidity_score: Mapped[Optional[float]] = mapped_column(Double(53))
    sweetness_score: Mapped[Optional[float]] = mapped_column(Double(53))
    tannin_score: Mapped[Optional[float]] = mapped_column(Double(53))
    cost_score: Mapped[Optional[float]] = mapped_column(Double(53))
    rating_score: Mapped[Optional[float]] = mapped_column(Double(53))
    score: Mapped[Optional[float]] = mapped_column(Double(53))

    wine: Mapped["VivinoWines"] = relationship(
        "VivinoWines", back_populates="wine_quiz"
    )
