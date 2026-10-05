"""Pricing math for the edge scanner: odds conversion, de-vig, Kalshi fees, edges."""
import math

KALSHI_TAKER_RATE = 0.07  # fee = ceil(rate * multiplier * C * P * (1-P)) to the cent
FEE_CONTRACTS = 100
EDGE_THRESHOLD = 0.02


def american_to_prob(odds):
    odds = float(odds)
    if odds > 0:
        return 100 / (odds + 100)
    return -odds / (-odds + 100)


def american_to_decimal(odds):
    odds = float(odds)
    if odds > 0:
        return 1 + odds / 100
    return 1 + 100 / -odds


def devig(implied):
    """Proportionally scale a book's implied probabilities so they sum to 1."""
    total = sum(implied.values())
    return {k: p / total for k, p in implied.items()}


def kalshi_fee_per_contract(price, multiplier=1.0, contracts=FEE_CONTRACTS):
    """Taker fee per contract in dollars, rounded up to the cent per order."""
    raw_cents = KALSHI_TAKER_RATE * multiplier * contracts * price * (1 - price) * 100
    return math.ceil(round(raw_cents, 6)) / 100 / contracts


def edge_a(p_kalshi_mid, american_odds):
    """Bet the book, using Kalshi mid as fair value."""
    return p_kalshi_mid * american_to_decimal(american_odds) - 1


def edge_b(p_book_fair, kalshi_ask, fee):
    """Buy YES on Kalshi at ask + fee, using the de-vigged book prob as fair value."""
    return p_book_fair / (kalshi_ask + fee) - 1
