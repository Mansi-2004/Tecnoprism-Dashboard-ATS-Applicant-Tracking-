from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def check_jobs():
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017/")
    db_name = os.getenv("DB_NAME", "ATS_Tecnoprism")
    client = AsyncIOMotorClient(mongodb_url)
    db = client[db_name]
    
    # Check indexes on jobs collection
    indexes = await db.jobs.index_information()
    print(f"Indexes on jobs: {indexes}")
    
    # List jobs
    jobs = await db.jobs.find().to_list(None)
    print(f"Total jobs: {len(jobs)}")
    for j in jobs:
        print(f"Job: {j.get('title')}, ID: {j.get('_id')}")
        
    client.close()

if __name__ == "__main__":
    asyncio.run(check_jobs())
