# Setup

```bash
# Install uv (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env

# Install dependencies and activate virtual environment
uv sync
source .venv/bin/activate

# Run the app
make run
```

# Spotify Refresh Token

Run in browser to get code.
```
https://accounts.spotify.com/authorize?client_id=baac07f1249a49cca7a9d39a92bf25e9&response_type=code&redirect_uri=http%3A%2F%2F127.0.0.1%3A8888%2Fcallback&scope=user-follow-read%20playlist-modify-public%20playlist-modify-private
```

Replace CODE and CLIENT_SECRET below.
Run in shell to get refresh token.
```
curl -X POST "https://accounts.spotify.com/api/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=CODE&redirect_uri=http%3A%2F%2F127.0.0.1%3A8888%2Fcallback&client_id=baac07f1249a49cca7a9d39a92bf25e9&client_secret=CLIENT_SECRET"
```