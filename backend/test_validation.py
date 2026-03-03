import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import sys
sys.path.append(os.getcwd())
from app.schemas.job import ApplicationInDB
from app.routers.applications import _enrich_application

load_dotenv()

async def debug_enrich():
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL", "mongodb://localhost:27017"))
    db = client[os.getenv("DB_NAME", "ATS_Tecnoprism")]
    cursor = db.applications.find()
    async for app in cursor:
        enriched = await _enrich_application(app, db)
        try:
            ApplicationInDB(**enriched)
            print(f"App {enriched['_id']} IS VALID")
        except Exception as e:
            print(f"App {enriched['_id']} FAILS: {e}")
    client.close()

if __name__ == "__main__":
    asyncio.run(debug_enrich())
