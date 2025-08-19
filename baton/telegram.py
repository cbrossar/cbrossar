import os
import requests
from loguru import logger

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHANNEL_ID = os.getenv("TELEGRAM_CHANNEL_ID")


def send_telegram_message(message: str) -> bool:
    """
    Send a message to Telegram channel
    
    Args:
        message: The message to send
        
    Returns:
        bool: True if successful, False otherwise
    """
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHANNEL_ID:
        logger.warning("Telegram bot not configured - skipping message send")
        return False
        
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        data = {
            "chat_id": TELEGRAM_CHANNEL_ID,
            "text": message,
            "parse_mode": "HTML"  # Allows basic formatting
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