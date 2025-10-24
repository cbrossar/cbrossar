1. Setup on EC2 with cron jobs
2. Move to AWS Lambda or GCP compute free tier
3. Try GCP Cloud Run (Bingo)


# Spotify Refresh Token

Run in browser to get code.
```
https://accounts.spotify.com/authorize?client_id=baac07f1249a49cca7a9d39a92bf25e9&response_type=code&redirect_uri=http://localhost:8888/callback&scope=user-follow-read%20playlist-modify-public%20playlist-modify-private
```

Replace CODE and CLIENT_SECRET below.
Run in shell to get refresh token.
```
curl -X POST "https://accounts.spotify.com/api/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=CODE&redirect_uri=http://localhost:8888/callback&client_id=baac07f1249a49cca7a9d39a92bf25e9&client_secret=CLIENT_SECRET"
  ```