from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Body
from typing import List, Optional
from app.core.deps import get_current_active_user, check_role, get_db
from app.schemas.job import ApplicationCreate, ApplicationInDB, ApplicationStatus
from app.schemas.user import UserInDB, UserRole
from app.services.resume_extractor import extract_text_from_bytes, extract_applicant_info
from app.services.scoring_engine import evaluate_application_v2
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime
import os
import aiofiles
import uuid

router = APIRouter()

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

async def _enrich_application(app: dict, db: AsyncIOMotorDatabase) -> dict:
    app["_id"] = str(app["_id"])

    status_value = app.get("status", ApplicationStatus.APPLIED)
    if isinstance(status_value, ApplicationStatus):
        status_value = status_value.value
    app["status"] = status_value

    if "score" not in app:
        app["score"] = app.get("final_score", 0.0)

    applicant_id = app.get("applicant_id") or app.get("candidate_id")
    if applicant_id:
        app["applicant_id"] = str(applicant_id)

    if not app.get("applicant_name") and app.get("candidate_name"):
        app["applicant_name"] = app.get("candidate_name")

    if not app.get("applicant_name") and applicant_id and ObjectId.is_valid(applicant_id):
        user = await db.users.find_one({"_id": ObjectId(applicant_id)})
        if user:
            app["applicant_name"] = user.get("name")

    job_id = app.get("job_id")
    if not app.get("job_title") and job_id and ObjectId.is_valid(job_id):
        job = await db.jobs.find_one({"_id": ObjectId(job_id)})
        if job:
            app["job_title"] = job.get("title")

    return app

@router.post("/apply", response_model=ApplicationInDB)
async def apply_for_job(
    job_id: str = Form(...),
    file: UploadFile = File(...),
    current_user: UserInDB = Depends(check_role([UserRole.ADMIN, UserRole.HR, UserRole.INTERVIEWER])),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Check if job exists
    job = await db.jobs.find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    # Check if already applied
    existing_application = await db.applications.find_one({
        "job_id": job_id,
        "applicant_id": current_user.id
    })
    if existing_application:
        raise HTTPException(status_code=400, detail="You have already applied for this job")

    # Save file
    file_ext = file.filename.split(".")[-1]
    file_name = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    
    # Read file content ONCE
    file_content = await file.read()
    
    # Save file to disk
    async with aiofiles.open(file_path, 'wb') as out_file:
        await out_file.write(file_content)
    
    # Extract text and parsed data using the already-read bytes
    extracted_text = ""
    parsed_applicant_data = {}
    
    try:
        # Use extract_text_from_bytes with the content we already have
        extracted_text = extract_text_from_bytes(file_content, file.filename)
        parsed_applicant_data = extract_applicant_info(extracted_text)
        print(f"✓ Successfully extracted {len(extracted_text)} chars from {file.filename}")
        print(f"✓ Parsed data: name={parsed_applicant_data.get('name')}, skills={len(parsed_applicant_data.get('skills', []))}")
    except Exception as e:
        import traceback
        print(f"✗ Resume extraction error: {e}")
        traceback.print_exc()
        extracted_text = ""
        parsed_applicant_data = {}
    
    # Production scoring v2
    try:
        scoring_result = await evaluate_application_v2(
            parsed_applicant_data, 
            extracted_text, 
            job
        )
    except Exception as e:
        import traceback
        print(f"Scoring error: {e}")
        traceback.print_exc()
        scoring_result = {
            "skill_score": 0.0,
            "experience_score": 0.0,
            "education_score": 0.0,
            "semantic_score": 0.0,
            "final_score": 0.0,
            "matched_skills": [],
            "missing_skills": [],
            "skill_coverage": 0.0,
            "experience_match": 0.0,
            "semantic_similarity": 0.0,
            "breakdown": {}
        }
    
    # Create application document
    application_doc = {
        "job_id": job_id,
        "applicant_id": current_user.id,
        "candidate_id": current_user.id,
        "applicant_name": parsed_applicant_data.get('name') or current_user.name,
        "candidate_name": parsed_applicant_data.get('name') or current_user.name,
        "email": parsed_applicant_data.get('email') or current_user.email,
        "phone": parsed_applicant_data.get('phone'),
        "job_title": job.get("title"),
        "resume_file_path": file_path,
        "extracted_text": extracted_text,
        "parsed_data": parsed_applicant_data,
        "scoring": scoring_result,
        "score": scoring_result.get("final_score", 0.0),
        "final_score": scoring_result.get("final_score", 0.0),
        "status": ApplicationStatus.APPLIED.value,
        "applied_at": datetime.utcnow()
    }
    
    result = await db.applications.insert_one(application_doc)
    application_doc["_id"] = str(result.inserted_id)
    
    return ApplicationInDB(**application_doc)

@router.post("/public-apply", response_model=ApplicationInDB)
async def public_apply(
    job_id: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Check if job exists
    if job_id == "general":
        job = await db.jobs.find_one({"type": "general_pool"})
        if not job:
            # Create a virtual/placeholder job for general applications
            job_doc = {
                "title": "General Pool",
                "description": "General applicant pool for future opportunities",
                "type": "general_pool",
                "status": "active",
                "created_at": datetime.utcnow()
            }
            result = await db.jobs.insert_one(job_doc)
            job_doc["_id"] = result.inserted_id
            job = job_doc
        job_id = str(job["_id"])
    else:
        if not ObjectId.is_valid(job_id):
            raise HTTPException(status_code=400, detail="Invalid job ID")
        job = await db.jobs.find_one({"_id": ObjectId(job_id)})
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
    # Save file
    file_ext = file.filename.split(".")[-1]
    file_name = f"public_{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    
    file_content = await file.read()
    async with aiofiles.open(file_path, 'wb') as out_file:
        await out_file.write(file_content)
    
    extracted_text = ""
    parsed_applicant_data = {}
    
    try:
        extracted_text = extract_text_from_bytes(file_content, file.filename)
        parsed_applicant_data = extract_applicant_info(extracted_text)
    except Exception as e:
        print(f"✗ Public resume extraction error: {e}")
    
    try:
        scoring_result = await evaluate_application_v2(
            parsed_applicant_data, 
            extracted_text, 
            job
        )
    except Exception:
        scoring_result = {"final_score": 0.0}
    
    application_doc = {
        "job_id": job_id,
        "applicant_id": None,
        "applicant_name": parsed_applicant_data.get('name') or "Public Applicant",
        "candidate_name": parsed_applicant_data.get('name') or "Public Applicant",
        "email": parsed_applicant_data.get('email'),
        "phone": parsed_applicant_data.get('phone'),
        "job_title": job.get("title"),
        "resume_file_path": file_path,
        "extracted_text": extracted_text,
        "parsed_data": parsed_applicant_data,
        "scoring": scoring_result,
        "score": scoring_result.get("final_score", 0.0),
        "final_score": scoring_result.get("final_score", 0.0),
        "status": ApplicationStatus.APPLIED.value,
        "applied_at": datetime.utcnow()
    }
    
    result = await db.applications.insert_one(application_doc)
    application_doc["_id"] = str(result.inserted_id)
    
    return ApplicationInDB(**application_doc)
@router.get("/", response_model=List[ApplicationInDB])
async def list_applications(
    current_user: UserInDB = Depends(check_role([UserRole.ADMIN, UserRole.HR])),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    cursor = db.applications.find()
    apps = []
    async for app in cursor:
        app = await _enrich_application(app, db)
        apps.append(ApplicationInDB(**app))
    return apps

@router.get("/job/{job_id}", response_model=List[ApplicationInDB])
async def get_job_applications(
    job_id: str,
    current_user: UserInDB = Depends(check_role([UserRole.ADMIN, UserRole.HR])),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    cursor = db.applications.find({"job_id": job_id})
    apps = []
    async for app in cursor:
        app = await _enrich_application(app, db)
        apps.append(ApplicationInDB(**app))
    return apps

@router.get("/my-applications", response_model=List[ApplicationInDB])
async def get_my_applications(
    current_user: UserInDB = Depends(check_role([UserRole.ADMIN, UserRole.HR, UserRole.INTERVIEWER])),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    cursor = db.applications.find({"applicant_id": current_user.id})
    apps = []
    async for app in cursor:
        app = await _enrich_application(app, db)
        apps.append(ApplicationInDB(**app))
    return apps

@router.put("/{application_id}/status", response_model=ApplicationInDB)
async def update_application_status(
    application_id: str,
    status: ApplicationStatus = Body(..., embed=True),
    current_user: UserInDB = Depends(check_role([UserRole.ADMIN, UserRole.HR])),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    app = await db.applications.find_one({"_id": ObjectId(application_id)})
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    status_value = status.value if isinstance(status, ApplicationStatus) else status

    await db.applications.update_one(
        {"_id": ObjectId(application_id)},
        {"$set": {"status": status_value}}
    )
    
    updated_app = await db.applications.find_one({"_id": ObjectId(application_id)})
    updated_app = await _enrich_application(updated_app, db)
    
    # TODO: Send email notification
    
    return ApplicationInDB(**updated_app)
