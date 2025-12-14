import os
import uvicorn
import db
from fastapi import FastAPI
from routes import router

app = FastAPI()
app.include_router(router)


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8080))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)
