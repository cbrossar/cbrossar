"""The Odds API v4. /events is free; /odds costs markets x regions (1 credit here)."""
import os

import requests

BASE = "https://api.the-odds-api.com/v4"

SPORT_KEYS = {"nfl": "americanfootball_nfl", "epl": "soccer_epl"}
BOOK = "fanduel"


def _key():
    key = os.getenv("ODDS_API_KEY")
    if not key:
        raise RuntimeError("ODDS_API_KEY environment variable not set")
    return key


def get_events(sport):
    """Upcoming and live games. Does not count against quota."""
    resp = requests.get(
        f"{BASE}/sports/{SPORT_KEYS[sport]}/events",
        params={"apiKey": _key()},
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()


def get_odds(sport, event_ids):
    """FanDuel h2h American odds.

    Returns (games, credits_used, credits_remaining). Each game:
    {"id", "home_team", "away_team", "commence_time", "prices": {outcome: odds}}
    """
    resp = requests.get(
        f"{BASE}/sports/{SPORT_KEYS[sport]}/odds",
        params={
            "apiKey": _key(),
            "regions": "us",
            "markets": "h2h",
            "bookmakers": BOOK,
            "oddsFormat": "american",
            "eventIds": ",".join(event_ids),
        },
        timeout=15,
    )
    resp.raise_for_status()

    games = []
    for g in resp.json():
        prices = {}
        for b in g.get("bookmakers", []):
            for m in b.get("markets", []):
                if b["key"] == BOOK and m["key"] == "h2h":
                    prices = {o["name"]: o["price"] for o in m["outcomes"]}
        games.append(
            {
                "id": g["id"],
                "home_team": g["home_team"],
                "away_team": g["away_team"],
                "commence_time": g["commence_time"],
                "prices": prices,
            }
        )
    used = int(resp.headers.get("x-requests-last") or 0)
    remaining = resp.headers.get("x-requests-remaining")
    return games, used, int(float(remaining)) if remaining else None
