import requests
import os
import pymongo
from bson import ObjectId

# 1. Simulate Upload
url = "http://localhost:8000/api/v1/applications/public-apply"
# Create a dummy pdf file
with open("test_resume.pdf", "wb") as f:
    f.write(b"%PDF-1.4\n1 0 obj\n<< /Title (Test Resume) >>\nendobj")

files = {'file': ('test_resume.pdf', open('test_resume.pdf', 'rb'), 'application/pdf')}
data = {'job_id': 'general'}

print("Uploading...")
res = requests.post(url, files=files, data=data)
print(f"Status: {res.status_code}, Response: {res.json()}")

# 2. Check Database
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["ATS_Tecnoprism"]
apps = list(db.applications.find().sort("applied_at", -1).limit(1))

if apps:
    app = apps[0]
    print(f"Found in DB: ID={app['_id']}, Name={app.get('candidate_name')}, Applied At={app.get('applied_at')}")
else:
    print("Database is empty or latest entry not found!")

client.close()
os.remove("test_resume.pdf")
