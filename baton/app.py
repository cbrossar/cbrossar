from fastapi import FastAPI, HTTPException
from runners.health import run_health_check
from runners.player_gameweeks import run_player_gameweeks
from runners.last_5 import run_last_5_points
from runners.players import run_update_players
from runners.reddit_spurs import run_reddit_spurs
from runners.teams import run_teams
from logger import logger
import os
from utils.telegram import send_telegram_message, Channel
import uvicorn

app = FastAPI()


@app.get("/")
async def health_check():
    try:
        success = run_health_check()
        if not success:
            raise HTTPException(status_code=500, detail="Health check failed")
        return {"status": "healthy"}
    except Exception as e:
        logger.error(f"Health check error: {str(e)}")
        send_telegram_message(
            f"🚨 <b>Baton: Health check failed</b>\n\n{str(e)}", Channel.BATON
        )
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/players")
async def players():
    try:
        success = run_update_players()
        if not success:
            raise HTTPException(status_code=500, detail="Players update failed")
        success = run_teams()
        if not success:
            raise HTTPException(status_code=500, detail="Teams update failed")
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Players error: {str(e)}")
        send_telegram_message(
            f"🚨 <b>Baton: Players update failed</b>\n\n{str(e)}", Channel.BATON
        )
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/player-gameweeks")
async def player_gameweeks():
    try:
        success = run_player_gameweeks()
        if not success:
            raise HTTPException(
                status_code=500, detail="Player gameweeks update failed"
            )
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Player gameweeks error: {str(e)}")
        send_telegram_message(
            f"🚨 <b>Baton: Player gameweeks update failed</b>\n\n{str(e)}",
            Channel.BATON,
        )
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/last-5")
async def last_5():
    try:
        success = run_last_5_points()
        if not success:
            raise HTTPException(status_code=500, detail="Last 5 points update failed")
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Last 5 points error: {str(e)}")
        send_telegram_message(
            f"🚨 <b>Baton: Last 5 points update failed</b>\n\n{str(e)}", Channel.BATON
        )
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/reddit-spurs")
async def reddit_spurs():
    try:
        success = run_reddit_spurs()
        if not success:
            raise HTTPException(status_code=500, detail="Reddit Spurs update failed")
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Reddit Spurs error: {str(e)}")
        send_telegram_message(
            f"🚨 <b>Baton: Reddit Spurs update failed</b>\n\n{str(e)}", Channel.BATON
        )
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8080))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)
