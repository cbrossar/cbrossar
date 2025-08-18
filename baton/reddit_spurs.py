#!/usr/bin/env python3
"""
Reddit Spurs Script - Fetches newest posts from r/coys subreddit
"""

import requests
import json
import time
from datetime import datetime
from typing import List, Dict, Optional
import logging
from models import RedditSpurs
from db import Session


import os

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
    """Scraper for r/coys subreddit posts"""
    
    def __init__(self, user_agent: str = "SpursBot/1.0"):
        self.base_url = "https://www.reddit.com"
        self.subreddit = "coys"
        self.headers = {
            'User-Agent': user_agent
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)
    
    def get_newest_posts(self, limit: int = 25) -> List[Dict]:
        """
        Fetch the newest posts
        
        Args:
            limit: Number of posts to fetch (max 100)
            
        Returns:
            List of post dictionaries
        """
        url = f"{self.base_url}/r/{self.subreddit}/new.json"
        params = {
            'limit': min(limit, 100),  # Reddit API max is 100
            'raw_json': 1
        }
        
        try:
            logger.info(f"Fetching {limit} newest posts from r/{self.subreddit}")
            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            posts = data.get('data', {}).get('children', [])
            
            logger.info(f"Successfully fetched {len(posts)} posts")
            return self._parse_posts(posts)
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching posts: {e}")
            return []
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing JSON response: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return []
    
    def _parse_posts(self, posts: List[Dict]) -> List[Dict]:
        """Parse raw Reddit post data into clean format"""
        parsed_posts = []
        
        for post in posts:
            post_data = post.get('data', {})
            
            # Extract relevant post information
            parsed_post = {
                'id': post_data.get('id'),
                'title': post_data.get('title'),
                'author': post_data.get('author'),
                'score': post_data.get('score', 0),
                'upvote_ratio': post_data.get('upvote_ratio', 0),
                'num_comments': post_data.get('num_comments', 0),
                'created_utc': post_data.get('created_utc'),
                'created_date': datetime.fromtimestamp(post_data.get('created_utc', 0)).isoformat(),
                'url': post_data.get('url'),
                'permalink': f"https://reddit.com{post_data.get('permalink', '')}",
                'is_self': post_data.get('is_self', False),
                'selftext': post_data.get('selftext', '')[:200] + '...' if post_data.get('selftext') else '',
                'domain': post_data.get('domain'),
                'over_18': post_data.get('over_18', False),
                'spoiler': post_data.get('spoiler', False),
                'stickied': post_data.get('stickied', False)
            }
            
            parsed_posts.append(parsed_post)
        
        return parsed_posts
    
    def get_post_details(self, post_id: str) -> Optional[Dict]:
        """Get detailed information about a specific post"""
        url = f"{self.base_url}/r/{self.subreddit}/comments/{post_id}.json"
        
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            post_data = data[0]['data']['children'][0]['data']
            
            return {
                'id': post_data.get('id'),
                'title': post_data.get('title'),
                'author': post_data.get('author'),
                'score': post_data.get('score', 0),
                'upvote_ratio': post_data.get('upvote_ratio', 0),
                'num_comments': post_data.get('num_comments', 0),
                'created_utc': post_data.get('created_utc'),
                'created_date': datetime.fromtimestamp(post_data.get('created_utc', 0)).isoformat(),
                'url': post_data.get('url'),
                'permalink': f"https://reddit.com{post_data.get('permalink', '')}",
                'selftext': post_data.get('selftext', ''),
                'domain': post_data.get('domain'),
                'over_18': post_data.get('over_18', False),
                'spoiler': post_data.get('spoiler', False),
                'stickied': post_data.get('stickied', False)
            }
            
        except Exception as e:
            logger.error(f"Error fetching post details for {post_id}: {e}")
            return None
    
    def save_posts_to_file(self, posts: List[Dict], filename: str = None) -> str:
        """Save posts to a JSON file"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"coys_posts_{timestamp}.json"
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(posts, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Posts saved to {filename}")
            return filename
            
        except Exception as e:
            logger.error(f"Error saving posts to file: {e}")
            return ""

    def get_posts_by_flair(self, flair_name: str, limit: int = 25) -> List[Dict]:
        """
        Fetch posts from r/coys filtered by a specific flair
        
        Args:
            flair_name: Name of the flair to filter by (e.g., "Transfer News: Tier 1")
            limit: Number of posts to fetch (max 100)
            
        Returns:
            List of post dictionaries with the specified flair
        """
        url = f"{self.base_url}/r/{self.subreddit}/search.json"
        params = {
            'q': f'flair:"{flair_name}"',
            'restrict_sr': 'on',  # Restrict to subreddit
            'sort': 'new',  # Sort by newest
            't': 'all',  # Time period
            'limit': min(limit, 100),
            'raw_json': 1
        }
        
        try:
            logger.info(f"Fetching {limit} posts with flair '{flair_name}' from r/{self.subreddit}")
            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            posts = data.get('data', {}).get('children', [])
            
            logger.info(f"Successfully fetched {len(posts)} posts with flair '{flair_name}'")
            return self._parse_posts(posts)
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching posts with flair '{flair_name}': {e}")
            return []
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing JSON response: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return []

    def get_all_flairs(self) -> List[str]:
        """Get a list of all available flairs in the subreddit"""
        url = f"{self.base_url}/r/{self.subreddit}/about.json"
        
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            # Note: Reddit's API doesn't directly expose flair list
            # This would require scraping the subreddit page or using PRAW
            logger.info("Flair list not directly available via Reddit API")
            return []
            
        except Exception as e:
            logger.error(f"Error fetching flair information: {e}")
            return []


if __name__ == "__main__":
    run_reddit_spurs()

