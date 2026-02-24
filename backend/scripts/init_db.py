import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "ATS_Tecnoprism")

async def init():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]
    
    print(f"Connecting to MongoDB at {MONGODB_URL}")
    print(f"Database: {DB_NAME}\n")
    
    # Create users collection with indexes
    print("Creating 'users' collection...")
    try:
        await db.users.create_index("email", unique=True)
        print("✓ Created 'users' collection with email unique index")
    except Exception as e:
        print(f"✓ 'users' collection already exists: {e}")
    
    # Create jobs collection with indexes
    print("\nCreating 'jobs' collection...")
    try:
        await db.jobs.create_index("created_by")
        await db.jobs.create_index("title")
        print("✓ Created 'jobs' collection with indexes")
    except Exception as e:
        print(f"✓ 'jobs' collection already exists: {e}")
    
    # Create applications collection with indexes
    print("\nCreating 'applications' collection...")
    try:
        await db.applications.create_index("applicant_id")
        await db.applications.create_index("job_id")
        await db.applications.create_index([("job_id", 1), ("applicant_id", 1)], unique=True)
        print("✓ Created 'applications' collection with indexes")
    except Exception as e:
        print(f"✓ 'applications' collection already exists: {e}")
    
    # Create scoring results collection
    print("\nCreating 'scoring_results' collection...")
    try:
        await db.scoring_results.create_index("application_id", unique=True)
        await db.scoring_results.create_index("job_id")
        print("✓ Created 'scoring_results' collection with indexes")
    except Exception as e:
        print(f"✓ 'scoring_results' collection already exists: {e}")
    
    # Verify connection
    print("\n" + "="*50)
    print("Database initialization complete!")
    print("="*50)
    
    # List all collections
    collections = await db.list_collection_names()
    print(f"\nCollections in '{DB_NAME}':")
    for collection in collections:
        print(f"  • {collection}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(init())
