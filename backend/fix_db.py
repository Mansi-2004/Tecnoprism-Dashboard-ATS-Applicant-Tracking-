from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def fix_indexes():
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017/")
    db_name = os.getenv("DB_NAME", "ATS_Tecnoprism")
    
    client = AsyncIOMotorClient(mongodb_url)
    db = client[db_name]
    
    print(f"Connecting to {db_name}...")
    
    # List indexes for applications
    try:
        indexes = await db.applications.list_indexes().to_list(length=100)
        print("Current indexes on 'applications':")
        for idx in indexes:
            print(f" - {idx['name']}: {idx['key']}")
            if idx['name'] != "_id_":
                print(f"   Dropping index {idx['name']}...")
                await db.applications.drop_index(idx['name'])
    except Exception as e:
        print(f"Error handling applications indexes: {e}")

    # Also check jobs just in case
    try:
        indexes = await db.jobs.list_indexes().to_list(length=100)
        print("Current indexes on 'jobs':")
        for idx in indexes:
            print(f" - {idx['name']}: {idx['key']}")
            if idx['name'] != "_id_":
                print(f"   Dropping index {idx['name']}...")
                await db.jobs.drop_index(idx['name'])
    except Exception as e:
        print(f"Error handling jobs indexes: {e}")

    print("Done.")
    client.close()

if __name__ == "__main__":
    asyncio.run(fix_indexes())
