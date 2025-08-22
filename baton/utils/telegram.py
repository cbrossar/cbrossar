import os
import requests
from loguru import logger

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
SPURS_CHANNEL_ID = "-1002928194045"
BATON_CHANNEL_ID = "-1003085470422"


def send_telegram_message(message: str) -> bool:
    if not TELEGRAM_BOT_TOKEN or not SPURS_CHANNEL_ID:
        logger.warning("Telegram bot not configured - skipping message send")
        return False

    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        data = {
            "chat_id": SPURS_CHANNEL_ID,
            "text": message,
            "parse_mode": "HTML",  # Allows basic formatting
        }

        response = requests.post(url, json=data, timeout=10)
        response.raise_for_status()

        logger.info("Telegram message sent successfully")
        return True

    except requests.exceptions.RequestException as e:
        logger.error(f"Error sending Telegram message: {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error sending Telegram message: {e}")
        return False
