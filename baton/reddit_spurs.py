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

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

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
        Fetch the newest posts from r/coys
        
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

def main():
    """Main function to demonstrate the scraper"""
    scraper = RedditSpursScraper()
    
    # Fetch posts with specific flair
    print("\n=== Fetching Transfer News: Tier 1 posts ===")
    tier1_posts = scraper.get_posts_by_flair("Transfer News: Tier 1", limit=10)
    
    if tier1_posts:
        print(f"\n=== Latest {len(tier1_posts)} Tier 1 Transfer posts ===\n")
        
        for i, post in enumerate(tier1_posts[:2], 1):
            print(f"{i}. {post['title']}")
            print(f"   Author: u/{post['author']}")
            print(f"   Score: {post['score']} | Comments: {post['num_comments']}")
            print(f"   Posted: {post['created_date']}")
            print(f"   URL: {post['permalink']}")
            print(f"   {'[SELF POST]' if post['is_self'] else '[LINK POST]'}")
            if post['selftext']:
                print(f"   Preview: {post['selftext']}")
            print()
        
      
    else:
        print("No Tier 1 transfer posts found. Check the logs for errors.")

if __name__ == "__main__":
    main()

