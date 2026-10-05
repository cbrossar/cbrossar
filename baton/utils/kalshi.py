"""Kalshi public market data (no auth)."""
from collections import defaultdict

import requests

BASE = "https://api.elections.kalshi.com/trade-api/v2"

SERIES = {"nfl": "KXNFLGAME", "epl": "KXEPLGAME"}


def get_fee_multiplier(sport):
    resp = requests.get(f"{BASE}/series/{SERIES[sport]}", timeout=15)
    resp.raise_for_status()
    return float(resp.json()["series"].get("fee_multiplier") or 1)


def get_open_events(sport):
    """Return {event_ticker: {"time": occurrence_datetime, "outcomes": {name: market}}}.

    Outcome names are Kalshi's yes_sub_title, e.g. "Los Angeles R", "Arsenal", "Tie".
    """
    markets, cursor = [], None
    while True:
        params = {"series_ticker": SERIES[sport], "status": "open", "limit": 1000}
        if cursor:
            params["cursor"] = cursor
        resp = requests.get(f"{BASE}/markets", params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        markets += data.get("markets", [])
        cursor = data.get("cursor")
        if not cursor:
            break

    events = defaultdict(lambda: {"time": None, "outcomes": {}})
    for m in markets:
        ev = events[m["event_ticker"]]
        ev["time"] = m.get("occurrence_datetime")
        ev["outcomes"][m["yes_sub_title"]] = {
            "ticker": m["ticker"],
            "bid": _price(m.get("yes_bid_dollars")),
            "ask": _price(m.get("yes_ask_dollars")),
            "no_ask": _price(m.get("no_ask_dollars")),
        }
    return dict(events)


def _price(value):
    """Dollar string -> float, or None when there is no real quote (0 or 1)."""
    try:
        p = float(value)
    except (TypeError, ValueError):
        return None
    return p if 0 < p < 1 else None
