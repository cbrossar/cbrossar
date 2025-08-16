import feedparser
import requests
import re
from datetime import datetime
import certifi
import ssl

# RSSHub feed URL
FEED_URL = "https://rss.app/feed/QfbHHwmcUSiz6SyO"

# Keywords to search for
KEYWORDS = ["tottenham", "spurs"]

def fetch_and_filter():
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"\n[{now}] Checking latest tweets...\n")

    # Fetch RSS with requests and proper SSL
    try:
        response = requests.get(
            FEED_URL,
            headers={"User-Agent": "Mozilla/5.0"},
            verify=certifi.where()  # Trust certifi CA bundle
        )
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"Error fetching RSS feed: {e}")
        return

    # Parse feed content
    feed = feedparser.parse(response.content)

    if not feed.entries:
        print("No entries found — RSSHub may be down or rate-limited.")
        return

    for entry in feed.entries:
        content = f"{entry.title} {entry.get('summary', '')}".lower()
        if any(re.search(rf"\b{k}\b", content) for k in KEYWORDS):
            print(f"Match found: {entry.title}")
            print(f"Link: {entry.link}")
            print("---")

if __name__ == "__main__":
    fetch_and_filter()
