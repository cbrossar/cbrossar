from logger import logger
import requests
import os
import datetime
from typing import Optional
from models import SpotifyReleases, MusicbrainzReleases
from db import Session
from utils.telegram import send_telegram_message, Channel
import random

CLIENT_ID = "baac07f1249a49cca7a9d39a92bf25e9"
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
REFRESH_TOKEN = os.getenv("SPOTIFY_REFRESH_TOKEN")
NEW_RELEASES_PLAYLIST_ID = "5JFQVM9ZFSd3OAKnmNEwg0"


def run_spotify():
    logger.info("Running Spotify runner")
    start_time = datetime.datetime.now()
    token = get_access_token()
    artists = get_followed_artists(token)
    logger.info(f"Found {len(artists)} followed artists")

    new_releases = get_new_releases(artists, token)
    logger.info(f"Found {len(new_releases)} new releases")

    if new_releases:
        add_releases_to_playlist(new_releases, token)
        logger.info(f"Added {len(new_releases)} new releases to playlist")

    end_time = datetime.datetime.now()
    duration = end_time - start_time
    logger.info(f"Spotify runner completed in {duration.total_seconds():.2f} seconds")

    return True


def get_new_releases(artists, token):
    with Session() as session:
        existing_release_ids = {
            release.id for release in session.query(SpotifyReleases).all()
        }

    new_releases = []
    new_release_ids = set()

    for artist in artists:

        get_musicbrainz_upcoming_release_groups(artist["name"])

        releases = get_artist_releases(token, artist["id"])
        for r in releases:
            if r["id"] in existing_release_ids or r["id"] in new_release_ids:
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
                notified=True,
                album_type=r["album_type"],
            )
            new_release_ids.add(spotify_release.id)
            new_releases.append(spotify_release)

            logger.info(
                f"Saving {spotify_release.name} by {spotify_release.artist_name}"
            )

            # if release date is within 30 days, send telegrammessage
            if spotify_release.release_date <= datetime.date.today() + datetime.timedelta(days=30):
                release_text = (
                    f"released today"
                    if spotify_release.release_date == datetime.date.today()
                    else f"releases on {spotify_release.release_date}"
                )
                music_emojis = ["🎺", "🎷", "🎸", "🎻", "🥁", "🪇", "🪗"]
                message = f"{random.choice(music_emojis)} Spotify Music Drop\n🎵 {spotify_release.name} by {spotify_release.artist_name} {release_text}!\n🎧 Listen: {spotify_release.spotify_url}"
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
def get_followed_artists(access_token, limit=50):
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
        "include_groups": "album",
        "limit": limit,
        "market": "US",  # optional, helps filter region-available releases
    }
    resp = requests.get(url, headers=headers, params=params)
    resp.raise_for_status()
    new_albums = resp.json()["items"]

    params = {
        "include_groups": "single",
        "limit": limit,
        "market": "US",  # optional, helps filter region-available releases
    }
    resp = requests.get(url, headers=headers, params=params)
    resp.raise_for_status()
    new_singles = resp.json()["items"]

    return new_albums + new_singles


def add_releases_to_playlist(releases, access_token):
    """Add new releases to a personal Spotify playlist"""

    playlist_url = (
        f"https://api.spotify.com/v1/playlists/{NEW_RELEASES_PLAYLIST_ID}/tracks"
    )
    headers = {"Authorization": f"Bearer {access_token}"}

    # Get track URIs from releases
    track_uris = []
    for release in releases:
        # For albums, we need to get the individual tracks
        if release.release_date_precision == "day":
            # This is a specific release date, get the tracks
            tracks = get_album_tracks(access_token, release.id)
            track_uris.extend([f"spotify:track:{track_id}" for track_id in tracks])
        else:
            # For year/month releases, we might want to skip or handle differently
            logger.info(f"Skipping {release.name} - not a specific day release")

    if not track_uris:
        logger.info("No tracks to add to playlist")
        return

    # Spotify allows up to 100 tracks per request
    batch_size = 100
    for i in range(0, len(track_uris), batch_size):
        batch = track_uris[i : i + batch_size]

        payload = {"uris": batch}
        resp = requests.post(playlist_url, headers=headers, json=payload)

        if resp.status_code == 201:
            logger.info(f"Added {len(batch)} tracks to playlist")
        else:
            logger.error(
                f"Failed to add tracks to playlist: {resp.status_code} - {resp.text}"
            )


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


def get_cover_art_url(release_id: str) -> Optional[str]:
    """
    Get cover art URL from Cover Art Archive for a MusicBrainz release.

    Args:
        release_id: MusicBrainz release ID

    Returns:
        Cover art URL or None if not available
    """
    try:
        # First try to get the JSON API to check available images
        caa_url = f"https://coverartarchive.org/release/{release_id}"
        response = requests.get(caa_url, timeout=5)

        if response.status_code == 200:
            data = response.json()
            images = data.get("images", [])

            # Look for front cover
            for image in images:
                if image.get("front", False):
                    return image.get("image")

            # If no front cover, return the first available image
            if images:
                return images[0].get("image")

        # Fallback: try direct front cover URL
        front_url = f"https://coverartarchive.org/release/{release_id}/front"
        response = requests.head(front_url, timeout=5)

        if response.status_code == 200:
            return front_url

    except Exception as e:
        logger.debug(f"Failed to get cover art for release {release_id}: {e}")

    return None


def get_musicbrainz_upcoming_release_groups(artist_name: str):
    base_url = "https://musicbrainz.org/ws/2/"
    headers = {"User-Agent": "cbrossar/1.0 ( cole.brossart@gmail.com )"}

    today = datetime.date.today()
    existing_release_ids = set()
    with Session() as session:
        existing_release_ids = {
            release.id for release in session.query(MusicbrainzReleases).all()
        }
    upcoming_releases = []

    limit = 100
    offset = 0

    while True:
        params = {
            "query": f'artist:"{artist_name}"',
            "fmt": "json",
            "limit": limit,
            "offset": offset,
        }

        response = requests.get(
            f"{base_url}release-group", params=params, headers=headers
        )
        response.raise_for_status()
        data = response.json()

        release_groups = data.get("release-groups", [])
        if not release_groups:
            break

        for rg in release_groups:
            if rg.get("id") in existing_release_ids:
                continue

            title = rg.get("title")
            release_date = rg.get("first-release-date")

            if release_date:
                try:
                    parsed_date = datetime.date.fromisoformat(release_date)
                    if parsed_date > today:
                        # Get cover art URL for this release
                        image_url = None
                        releases = rg.get("releases")
                        index = 0
                        if releases:
                            while image_url is None and index < len(releases):
                                release_id = releases[index].get("id")
                                image_url = get_cover_art_url(release_id)
                                index += 1

                        upcoming_releases.append(
                            MusicbrainzReleases(
                                title=title,
                                release_date=parsed_date.isoformat(),
                                id=rg.get("id"),
                                primary_type=rg.get("primary-type"),
                                artist_name=artist_name,
                                image_url=image_url,
                            )
                        )
                except Exception:
                    pass

        # pagination
        offset += limit
        if offset >= data.get("release-group-count", 0):
            break

    if upcoming_releases:
        with Session.begin() as session:
            logger.info(f"Adding {len(upcoming_releases)} upcoming releases")
            session.bulk_save_objects(upcoming_releases)

        for release in upcoming_releases:
            music_emojis = ["🎺", "🎷", "🎸", "🎻", "🥁", "🪇", "🪗"]
            message = f"{random.choice(music_emojis)} Musicbrainz Upcoming Release\n🎵 {release.title} by {release.artist_name} releases on {release.release_date}"
            send_telegram_message(message, Channel.SPOTIFY)

    return upcoming_releases
