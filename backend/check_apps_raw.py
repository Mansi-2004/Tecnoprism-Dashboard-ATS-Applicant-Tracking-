import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

async def list_raw():
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL", "mongodb://localhost:27017"))
    db = client[os.getenv("DB_NAME", "ATS_Tecnoprism")]
    cursor = db.applications.find()
    async for app in cursor:
        print(f"ID: {app['_id']}, JobID: {app.get('job_id')}, Candidate: {app.get('candidate_name')}, Status: {app.get('status')}")
    client.close()

if __name__ == "__main__":
    asyncio.run(list_raw())
