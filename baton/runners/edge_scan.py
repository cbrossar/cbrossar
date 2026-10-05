import json
import os
from datetime import datetime, timedelta, timezone

from db import Session
from logger import logger
from models import EdgeOutcomes, EdgeScans
from utils import edges, kalshi, odds_api

SPORTS = ("nfl", "epl")
WINDOW_HOURS = 24

with open(os.path.join(os.path.dirname(__file__), "..", "utils", "edge_teams.json")) as f:
    TEAMS = json.load(f)  # Kalshi yes_sub_title -> The Odds API team name


def run_edge_scan():
    """Compare Kalshi and FanDuel moneylines for live games and games in the next 24h.

    Costs 1 Odds API credit per sport that has games in the window.
    """
    logger.info("Running edge scan")
    now = datetime.now(timezone.utc)
    rows, credits_used, credits_remaining, games_scanned = [], 0, None, 0

    for sport in SPORTS:
        wanted = [
            e
            for e in odds_api.get_events(sport)
            if _parse_time(e["commence_time"]) <= now + timedelta(hours=WINDOW_HOURS)
        ]
        if not wanted:
            logger.info(f"Edge scan: no {sport} games in window, skipping odds call")
            continue

        fee_multiplier = kalshi.get_fee_multiplier(sport)
        kalshi_events = kalshi.get_open_events(sport)
        games, used, credits_remaining = odds_api.get_odds(
            sport, [e["id"] for e in wanted]
        )
        credits_used += used

        for game in games:
            markets = _match_kalshi_event(sport, game, kalshi_events)
            if not markets:
                logger.info(
                    f"Edge scan: no Kalshi match for {game['away_team']} @ {game['home_team']}"
                )
                continue
            games_scanned += 1
            rows += _outcome_rows(sport, game, markets, fee_multiplier, now)

    with Session() as session:
        scan = EdgeScans(
            credits_used=credits_used,
            credits_remaining=credits_remaining,
            games=games_scanned,
        )
        session.add(scan)
        session.flush()
        session.add_all(EdgeOutcomes(scan_id=scan.id, **row) for row in rows)
        session.commit()
        scan_id = str(scan.id)

    logger.info(
        f"Edge scan complete: {games_scanned} games, {len(rows)} outcomes, "
        f"{credits_used} credits used, {credits_remaining} remaining"
    )
    return {
        "scan_id": scan_id,
        "games": games_scanned,
        "outcomes": len(rows),
        "credits_used": credits_used,
        "credits_remaining": credits_remaining,
    }


def _parse_time(s):
    return datetime.fromisoformat(s.replace("Z", "+00:00"))


def _kalshi_to_odds_name(sport, kalshi_name, game):
    name = TEAMS[sport].get(kalshi_name)
    if name:
        return name
    for team in (game["home_team"], game["away_team"]):
        if team.startswith(kalshi_name):
            return team
    return None


def _match_kalshi_event(sport, game, kalshi_events):
    """Find the Kalshi event for this game; return {odds_api_name: market} or None."""
    teams = {game["home_team"], game["away_team"]}
    start = _parse_time(game["commence_time"])
    best, best_gap = None, None
    for ev in kalshi_events.values():
        outcomes = {
            _kalshi_to_odds_name(sport, k, game): m for k, m in ev["outcomes"].items()
        }
        if not teams <= outcomes.keys() or not ev["time"]:
            continue
        # Kalshi's occurrence_datetime is roughly the scheduled end of the game.
        gap = (_parse_time(ev["time"]) - start).total_seconds()
        if -6 * 3600 <= gap <= 12 * 3600 and (best_gap is None or abs(gap) < best_gap):
            best, best_gap = outcomes, abs(gap)
    return best


def _outcome_rows(sport, game, markets, fee_multiplier, now):
    label = (
        f"{game['away_team']} @ {game['home_team']}"
        if sport == "nfl"
        else f"{game['home_team']} vs {game['away_team']}"
    )
    names = [game["away_team"], game["home_team"]]
    if "Draw" in markets:
        names.append("Draw")

    prices = game["prices"]
    fair = (
        edges.devig({n: edges.american_to_prob(prices[n]) for n in names})
        if all(n in prices for n in names)
        else {}
    )
    commence = _parse_time(game["commence_time"])

    rows = []
    for name in names:
        m = markets[name]
        bid, ask, no_ask = m["bid"], m["ask"], m["no_ask"]
        mid = (bid + ask) / 2 if bid and ask else None
        fd = prices.get(name)
        p_fair = fair.get(name)

        edge_b_yes = edge_b_no = None
        if p_fair is not None:
            if ask:
                fee = edges.kalshi_fee_per_contract(ask, fee_multiplier)
                edge_b_yes = edges.edge_b(p_fair, ask, fee)
            if no_ask:
                # Buying NO pays out when this outcome does NOT happen
                fee = edges.kalshi_fee_per_contract(no_ask, fee_multiplier)
                edge_b_no = edges.edge_b(1 - p_fair, no_ask, fee)

        rows.append(
            {
                "sport": sport,
                "game": label,
                "team": name,
                "commence_time": commence,
                "is_live": commence <= now,
                "kalshi_ticker": m["ticker"],
                "kalshi_bid": bid,
                "kalshi_ask": ask,
                "kalshi_no_ask": no_ask,
                "fd_odds": fd,
                "fd_fair_prob": p_fair,
                "edge_a": edges.edge_a(mid, fd) if mid and fd is not None else None,
                "edge_b_yes": edge_b_yes,
                "edge_b_no": edge_b_no,
            }
        )
    return rows
