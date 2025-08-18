#!/usr/bin/env python3
"""
Reddit Spurs Script - Fetches newest posts from r/coys subreddit using PRAW
"""

import os
import requests
from datetime import datetime
from typing import List, Dict
import logging
from models import RedditSpurs
from db import Session
import praw

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHANNEL_ID = os.getenv("TELEGRAM_CHANNEL_ID")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def run_reddit_spurs():
    """Run the Reddit Spurs scraper"""
    scraper = RedditSpursScraper()
    posts = scraper.get_posts_by_flair(flair_name="Transfer News: Tier 1", limit=10)

    save_posts_to_db(posts)

    return True


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


def save_posts_to_db(posts: List[Dict]):
    """Save posts to the database"""

    post_ids = [post['id'] for post in posts]

    with Session() as session:
        existing_posts = session.query(RedditSpurs).filter(RedditSpurs.reddit_id.in_(post_ids)).all()
        existing_post_ids = [post.reddit_id for post in existing_posts]

        for post in posts:
            if post['id'] in existing_post_ids:
                continue

            # send telegram message
            message = f"<b>{post['title']}</b>\n"
            message += f"👤 by u/{post['author']}\n"
            message += f"🔗 <a href='{post['permalink']}'>View on Reddit</a>"
            
            if post.get('url') and not post.get('is_self', False):
                message += f"\n🌐 <a href='{post['url']}'>External Link</a>"
            
            send_telegram_message(message)

            db_post = RedditSpurs(
                reddit_id=post['id'],
                title=post['title'],
                author=post['author'],
                created_date=post['created_date'],
                url=post['url'],
                permalink=post['permalink']
            )
            session.add(db_post)
        session.commit()

class RedditSpursScraper:
    """Scraper for r/coys subreddit posts using PRAW"""
    
    def __init__(self):
        # Initialize PRAW Reddit instance
        self.reddit = praw.Reddit(
            client_id=os.getenv("REDDIT_CLIENT_ID"),
            client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
            user_agent="SpursNewsBot/1.0 (by /u/your_username)"
        )
        self.subreddit = self.reddit.subreddit("coys")
        logger.info("PRAW Reddit instance initialized successfully")
    
    def get_newest_posts(self, limit: int = 25) -> List[Dict]:
        """
        Fetch the newest posts using PRAW
        
        Args:
            limit: Number of posts to fetch
            
        Returns:
            List of post dictionaries
        """
        try:
            logger.info(f"Fetching {limit} newest posts from r/{self.subreddit.display_name}")
            
            posts = []
            for submission in self.subreddit.new(limit=limit):
                post = self._convert_submission_to_dict(submission)
                posts.append(post)
            
            logger.info(f"Successfully fetched {len(posts)} posts using PRAW")
            return posts
            
        except Exception as e:
            logger.error(f"Error fetching newest posts with PRAW: {e}")
            return []
    
    def get_posts_by_flair(self, flair_name: str, limit: int = 25) -> List[Dict]:
        """
        Fetch posts from r/coys filtered by a specific flair using PRAW
        
        Args:
            flair_name: Name of the flair to filter by (e.g., "Transfer News: Tier 1")
            limit: Number of posts to fetch
            
        Returns:
            List of post dictionaries with the specified flair
        """
        try:
            logger.info(f"Fetching {limit} posts with flair '{flair_name}' from r/{self.subreddit.display_name}")
            
            # Search for posts with specific flair
            search_query = f'flair:"{flair_name}"'
            posts = []
            
            for submission in self.subreddit.search(search_query, sort="new", limit=limit):
                post = self._convert_submission_to_dict(submission)
                posts.append(post)
            
            logger.info(f"Successfully fetched {len(posts)} posts with flair '{flair_name}' using PRAW")
            return posts
            
        except Exception as e:
            logger.error(f"Error fetching posts with flair '{flair_name}' using PRAW: {e}")
            return []
    
    def _convert_submission_to_dict(self, submission) -> Dict:
        """Convert PRAW submission object to dictionary format"""
        return {
            'id': submission.id,
            'title': submission.title,
            'author': str(submission.author) if submission.author else 'deleted',
            'created_date': datetime.fromtimestamp(submission.created_utc).isoformat(),
            'url': submission.url,
            'permalink': f"https://reddit.com{submission.permalink}",
            'score': submission.score,
            'num_comments': submission.num_comments,
            'is_self': submission.is_self,
            'selftext': submission.selftext if submission.is_self else ''
        }


if __name__ == "__main__":
    run_reddit_spurs()

