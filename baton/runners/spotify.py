from logger import logger
import requests
import os
import datetime
from models import SpotifyReleases
from db import Session
from utils.telegram import send_telegram_message, Channel

CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
REFRESH_TOKEN = os.getenv("SPOTIFY_REFRESH_TOKEN")
NEW_RELEASES_PLAYLIST_ID = "5JFQVM9ZFSd3OAKnmNEwg0"

def run_spotify():
    logger.info("Running Spotify runner")
    token = get_access_token()

    artists = get_followed_artists(token)
    logger.info(f"Found {len(artists)} followed artists")

    new_releases = get_new_releases(artists, token)
    logger.info(f"Found {len(new_releases)} new releases")  

    today_releases = notify_today_releases()
    logger.info(f"Found {len(today_releases)} today's releases")

    if today_releases:
        add_releases_to_playlist(today_releases, token)
        logger.info(f"Added {len(today_releases)} today's releases to playlist")

    return True


def notify_today_releases():
    today = datetime.date.today()
    with Session() as session:
        today_releases = session.query(SpotifyReleases).filter(
            SpotifyReleases.release_date == today,
            SpotifyReleases.notified == False,
        ).all()
        logger.info(f"Found {len(today_releases)} releases for today")

        # Extract necessary data before closing session
        releases_data = []
        for release in today_releases:
            message = f"🚨 Music Drop!\n🎵 {release.name} by {release.artist_name} released today!\n🎧 Listen: {release.spotify_url}"
            send_telegram_message(message, Channel.SPOTIFY)
            release.notified = True
            
            # Store the data we need for playlist addition
            releases_data.append({
                'id': release.id,
                'name': release.name,
                'artist_name': release.artist_name,
                'spotify_url': release.spotify_url,
                'release_date_precision': release.release_date_precision
            })
        
        session.commit()

    return releases_data


def get_new_releases(artists, token):
    with Session() as session:
        existing_release_ids = {
            release.id for release in session.query(SpotifyReleases).all()
        }

    new_releases = []

    for artist in artists:
        releases = get_artist_releases(token, artist["id"])
        for r in releases:
            if r["id"] in existing_release_ids:
                continue

            release_date = (
                datetime.date(int(r["release_date"]), 1, 1)
                if r.get("release_date_precision") == "year"
                else r["release_date"]
            )

            spotify_release = SpotifyReleases(
                id=r["id"],
                artist_id=artist["id"],
                artist_name=artist["name"],
                name=r["name"],
                release_date=release_date,
                release_date_precision=r["release_date_precision"],
                spotify_url=r["external_urls"]["spotify"],
                image_url=r["images"][0]["url"] if r["images"] else None,
                notified=False,
            )
            new_releases.append(spotify_release)

            logger.info(
                f"Saved {spotify_release.name} by {spotify_release.artist_name}"
            )

            message = f"🪇 New Release!\n🎵 {spotify_release.name} by {spotify_release.artist_name} releases on {spotify_release.release_date}\n🎧 Listen: {spotify_release.spotify_url}"
            send_telegram_message(message, Channel.SPOTIFY)

    if new_releases:
        with Session.begin() as session:
            logger.info(f"Adding {len(new_releases)} new releases")
            session.bulk_save_objects(new_releases)

    return new_releases

# Get fresh access token using refresh token
def get_access_token():
    resp = requests.post(
        "https://accounts.spotify.com/api/token",
        data={
            "grant_type": "refresh_token",
            "refresh_token": REFRESH_TOKEN,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        },
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


# Get followed artists
def get_followed_artists(access_token, limit=20):
    url = "https://api.spotify.com/v1/me/following"
    headers = {"Authorization": f"Bearer {access_token}"}
    params = {"type": "artist", "limit": limit}
    artists = []

    while True:
        resp = requests.get(url, headers=headers, params=params)
        resp.raise_for_status()
        data = resp.json()
        items = data["artists"]["items"]
        artists.extend(items)

        # check if next page exists
        next_url = data["artists"]["next"]
        if not next_url:
            break
        url = next_url
        params = None  # Spotify encodes params in the next URL already

    return artists


# Get recent albums/singles for an artist
def get_artist_releases(access_token, artist_id, limit=5):
    url = f"https://api.spotify.com/v1/artists/{artist_id}/albums"
    headers = {"Authorization": f"Bearer {access_token}"}
    params = {
        "include_groups": "album,single",
        "limit": limit,
        "market": "US",  # optional, helps filter region-available releases
    }
    resp = requests.get(url, headers=headers, params=params)
    resp.raise_for_status()
    return resp.json()["items"]


def add_releases_to_playlist(releases, access_token):
    """Add new releases to a personal Spotify playlist"""


    playlist_url = f"https://api.spotify.com/v1/playlists/{NEW_RELEASES_PLAYLIST_ID}/tracks"
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # Get track URIs from releases
    track_uris = []
    for release in releases:
        # For albums, we need to get the individual tracks
        if release['release_date_precision'] == "day":
            # This is a specific release date, get the tracks
            tracks = get_album_tracks(access_token, release['id'])
            track_uris.extend([f"spotify:track:{track_id}" for track_id in tracks])
        else:
            # For year/month releases, we might want to skip or handle differently
            logger.info(f"Skipping {release['name']} - not a specific day release")
    
    if not track_uris:
        logger.info("No tracks to add to playlist")
        return
    
    # Spotify allows up to 100 tracks per request
    batch_size = 100
    for i in range(0, len(track_uris), batch_size):
        batch = track_uris[i:i + batch_size]
        
        payload = {"uris": batch}
        resp = requests.post(playlist_url, headers=headers, json=payload)
        
        if resp.status_code == 201:
            logger.info(f"Added {len(batch)} tracks to playlist")
        else:
            logger.error(f"Failed to add tracks to playlist: {resp.status_code} - {resp.text}")


def get_album_tracks(access_token, album_id):
    """Get all track IDs from an album"""
    url = f"https://api.spotify.com/v1/albums/{album_id}/tracks"
    headers = {"Authorization": f"Bearer {access_token}"}
    params = {"limit": 50}  # Spotify's max for album tracks
    
    track_ids = []
    
    while True:
        resp = requests.get(url, headers=headers, params=params)
        resp.raise_for_status()
        data = resp.json()
        
        # Extract track IDs
        for track in data["items"]:
            track_ids.append(track["id"])
        
        # Check if there are more tracks
        if data["next"]:
            url = data["next"]
            params = None  # Spotify encodes params in the next URL
        else:
            break
    
    return track_ids
