import unittest
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from runners import spotify


def fake_response(status_code, body=None):
    resp = MagicMock(status_code=status_code, text="")
    resp.json.return_value = body
    if status_code >= 400:
        resp.raise_for_status.side_effect = spotify.requests.HTTPError(
            f"{status_code} Client Error", response=resp
        )
    return resp


class FakeSpotify:
    """Accepts only the newest token, like Spotify once the old one expires"""

    def __init__(self, routes):
        self.routes = routes
        self.valid_token = "token-1"
        self.tokens_issued = 0
        self.calls = []

    def issue_token(self):
        self.tokens_issued += 1
        self.valid_token = f"token-{self.tokens_issued}"
        return self.valid_token

    def expire_token(self):
        self.valid_token = None

    def request(self, method, url, headers=None, **kwargs):
        self.calls.append((method, url, kwargs))
        if headers["Authorization"] != f"Bearer {self.valid_token}":
            return fake_response(401)
        return fake_response(*self.routes[method])


class TestTokenRefresh(unittest.TestCase):
    def setUp(self):
        self.api = FakeSpotify(
            {
                "GET": (200, {"items": [{"id": "x"}], "next": None}),
                "POST": (201, {}),
            }
        )
        for patcher in [
            patch.object(spotify, "get_access_token", self.api.issue_token),
            patch.object(spotify.requests, "request", self.api.request),
        ]:
            patcher.start()
            self.addCleanup(patcher.stop)
        self.token = spotify.SpotifyToken()

    def test_valid_token_is_not_refreshed(self):
        spotify.get_artist_releases(self.token, "artist")
        self.assertEqual(self.api.tokens_issued, 1)

    def test_expired_token_refreshes_once_and_stays_fresh(self):
        self.api.expire_token()

        first = spotify.get_artist_releases(self.token, "artist-1")
        second = spotify.get_artist_releases(self.token, "artist-2")

        self.assertEqual(len(first), 2)
        self.assertEqual(len(second), 2)
        self.assertEqual(self.api.tokens_issued, 2)

    def test_playlist_step_survives_expired_token(self):
        self.api.expire_token()
        release = SimpleNamespace(
            id="album", name="Album", release_date_precision="day"
        )

        spotify.add_releases_to_playlist([release], self.token)

        posts = [call for call in self.api.calls if call[0] == "POST"]
        self.assertEqual(self.api.tokens_issued, 2)
        self.assertEqual(len(posts), 1)
        self.assertEqual(posts[0][2]["json"], {"uris": ["spotify:track:x"]})

    def test_playlist_post_retries_with_fresh_token(self):
        release = SimpleNamespace(
            id="album", name="Album", release_date_precision="day"
        )
        real_tracks = spotify.get_album_tracks

        def tracks_then_expire(token, album_id):
            tracks = real_tracks(token, album_id)
            self.api.expire_token()
            return tracks

        with patch.object(spotify, "get_album_tracks", tracks_then_expire):
            spotify.add_releases_to_playlist([release], self.token)

        posts = [call for call in self.api.calls if call[0] == "POST"]
        self.assertEqual(self.api.tokens_issued, 2)
        self.assertEqual(len(posts), 2)  # the 401, then the retry

    def test_still_unauthorized_after_refresh_raises(self):
        self.api.expire_token()
        with patch.object(spotify, "get_access_token", return_value="rejected"):
            with self.assertRaises(spotify.requests.HTTPError):
                spotify.get_artist_releases(self.token, "artist")


if __name__ == "__main__":
    unittest.main()
