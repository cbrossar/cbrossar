"""Kalshi public market data (no auth)."""
from collections import defaultdict

import time

import requests

from logger import logger

# Kalshi serves the same public API from both hosts; fall back if one refuses us.
# api.elections.kalshi.com blocks Cloud Run egress IPs (CloudFront 403), so try external-api first.
HOSTS = ("https://external-api.kalshi.com", "https://api.elections.kalshi.com")
HEADERS = {"User-Agent": "cbrossar-baton/1.0", "Accept": "application/json"}

SERIES = {"nfl": "KXNFLGAME", "epl": "KXEPLGAME"}


def _get(path, params=None):
    """GET a public Kalshi endpoint, trying each host twice before giving up."""
    resp = None
    for attempt in range(2):
        for host in HOSTS:
            resp = requests.get(
                f"{host}/trade-api/v2{path}", params=params, headers=HEADERS, timeout=15
            )
            if resp.ok:
                return resp.json()
            logger.warning(
                f"Kalshi {resp.status_code} from {host}{path}: {resp.text[:300]!r}"
            )
        time.sleep(1)
    resp.raise_for_status()


def get_fee_multiplier(sport):
    data = _get(f"/series/{SERIES[sport]}")
    return float(data["series"].get("fee_multiplier") or 1)


def get_open_events(sport):
    """Return {event_ticker: {"time": occurrence_datetime, "outcomes": {name: market}}}.

    Outcome names are Kalshi's yes_sub_title, e.g. "Los Angeles R", "Arsenal", "Tie".
    """
    markets, cursor = [], None
    while True:
        params = {"series_ticker": SERIES[sport], "status": "open", "limit": 1000}
        if cursor:
            params["cursor"] = cursor
        data = _get("/markets", params)
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
