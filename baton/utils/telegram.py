import os
import requests
from loguru import logger
from enum import Enum
from typing import Union

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
SPURS_CHANNEL_ID = "-1002928194045"
BATON_CHANNEL_ID = "-1003085470422"
FANTASY_PREM_CHANNEL_ID = "-1003017705597"
SPOTIFY_CHANNEL_ID = "-1002921058470"


class Channel(Enum):
    SPURS = "spurs"
    BATON = "baton"
    FANTASY_PREM = "fantasy_prem"
    SPOTIFY = "spotify"

    def get_channel_id(self) -> Union[str, None]:
        """Get the Telegram channel ID for this channel."""
        if self == Channel.SPURS:
            return SPURS_CHANNEL_ID
        elif self == Channel.BATON:
            return BATON_CHANNEL_ID
        elif self == Channel.FANTASY_PREM:
            return FANTASY_PREM_CHANNEL_ID
        elif self == Channel.SPOTIFY:
            return SPOTIFY_CHANNEL_ID
        else:
            return None


def send_telegram_message(message: str, channel: Channel = Channel.SPURS) -> bool:
    if not TELEGRAM_BOT_TOKEN:
        logger.warning("Telegram bot not configured - skipping message send")
        return False

    channel_id = channel.get_channel_id()
    if not channel_id:
        logger.warning(
            f"Channel ID not configured for {channel.value} - skipping message send"
        )
        return False

    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        data = {
            "chat_id": channel_id,
            "text": message,
            "parse_mode": "HTML",  # Allows basic formatting
        }

        response = requests.post(url, json=data, timeout=10)
        response.raise_for_status()

        logger.info(f"Telegram message sent successfully to {channel.value} channel")
        return True

    except requests.exceptions.RequestException as e:
        logger.error(f"Error sending Telegram message to {channel.value} channel: {e}")
        return False
    except Exception as e:
        logger.error(
            f"Unexpected error sending Telegram message to {channel.value} channel: {e}"
        )
        return False
