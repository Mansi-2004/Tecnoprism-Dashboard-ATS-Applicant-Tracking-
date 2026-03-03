from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Body
from typing import List, Optional
from app.core.deps import get_current_active_user, check_role, get_db
from app.schemas.job import ApplicationCreate, ApplicationInDB, ApplicationStatus
from app.schemas.user import UserInDB, UserRole
from app.services.resume_extractor import extract_text_from_bytes, extract_candidate_info
from app.services.scoring_engine import evaluate_application_v2
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime
import os
import aiofiles
import uuid
import re

router = APIRouter()

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

async def _enrich_application(app: dict, db: AsyncIOMotorDatabase) -> dict:
    if "_id" in app:
        app["_id"] = str(app["_id"])

    # Map legacy applicant_id to candidate_id
    if "candidate_id" not in app and "applicant_id" in app:
        app["candidate_id"] = app["applicant_id"]
    
    # Ensure mandatory fields for ApplicationInDB exist
    if "candidate_id" not in app:
        app["candidate_id"] = "unknown_" + app["_id"][:8]
    if "resume_file_path" not in app:
        app["resume_file_path"] = "unknown"
    if "job_id" not in app:
        app["job_id"] = "general"

    status_value = app.get("status", ApplicationStatus.APPLIED)
    if isinstance(status_value, ApplicationStatus):
        status_value = status_value.value
    app["status"] = status_value

    if "score" not in app:
        app["score"] = app.get("final_score", 0.0)

    candidate_id = app.get("candidate_id")
    if not app.get("candidate_name") and candidate_id:
        if ObjectId.is_valid(candidate_id):
            user = await db.users.find_one({"_id": ObjectId(candidate_id)})
            if user:
                app["candidate_name"] = user.get("name")
        else:
            # For public or legacy IDs, try to find by candidate_id if it's used elsewhere
            # or just leave as is (likely set in doc already)
            pass

    job_id = app.get("job_id")
    if not app.get("job_title") and job_id:
        if ObjectId.is_valid(job_id):
            job = await db.jobs.find_one({"_id": ObjectId(job_id)})
            if job:
                app["job_title"] = job.get("title")
        else:
            app["job_title"] = "General Pool" if job_id == "general" else "Position"

    return app

@router.post("/apply", response_model=ApplicationInDB)
async def apply_for_job(
    job_id: str = Form(...),
    file: UploadFile = File(...),
    current_user: UserInDB = Depends(check_role([UserRole.CANDIDATE])),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Check if job exists
    job = await db.jobs.find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    # Check if already applied
    existing_application = await db.applications.find_one({
        "job_id": job_id,
        "candidate_id": current_user.id
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
    parsed_candidate_data = {}
    
    try:
        # Use extract_text_from_bytes with the content we already have
        extracted_text = extract_text_from_bytes(file_content, file.filename)
        parsed_candidate_data = extract_candidate_info(extracted_text)
        print(f"✓ Successfully extracted {len(extracted_text)} chars from {file.filename}")
        print(f"✓ Parsed data: name={parsed_candidate_data.get('name')}, skills={len(parsed_candidate_data.get('skills', []))}")
    except Exception as e:
        import traceback
        print(f"✗ Resume extraction error: {e}")
        traceback.print_exc()
        extracted_text = ""
        parsed_candidate_data = {}
    
    # Production scoring v2
    try:
        scoring_result = await evaluate_application_v2(
            parsed_candidate_data, 
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
    
    application_doc = {
        "job_id": job_id,
        "candidate_id": current_user.id,
        "candidate_name": current_user.name,
        "job_title": job.get("title"),
        "resume_file_path": file_path,
        "extracted_text": extracted_text,
        "parsed_data": parsed_candidate_data,  # NEW: Structured candidate data
        "scoring": scoring_result,  # NEW: Full scoring breakdown
        "score": scoring_result.get("final_score", 0.0),  # For backward compatibility
        "final_score": scoring_result.get("final_score", 0.0),  # For backward compatibility
        "status": ApplicationStatus.APPLIED.value,
        "applied_at": datetime.utcnow()
    }
    
    result = await db.applications.insert_one(application_doc)
    application_doc["_id"] = str(result.inserted_id)
    
    return ApplicationInDB(**application_doc)

@router.get("/", response_model=List[ApplicationInDB])
async def list_applications(
    current_user: UserInDB = Depends(check_role([UserRole.ADMIN, UserRole.HR, UserRole.RECRUITER])),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    cursor = db.applications.find()
    apps = []
    async for app in cursor:
        app = await _enrich_application(app, db)
        try:
            apps.append(ApplicationInDB(**app))
        except Exception as e:
            print(f"Skipping invalid application {app.get('_id')}: {e}")
            continue
    return apps

@router.get("/job/{job_id}", response_model=List[ApplicationInDB])
async def get_job_applications(
    job_id: str,
    current_user: UserInDB = Depends(check_role([UserRole.ADMIN, UserRole.HR, UserRole.RECRUITER])),
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
    current_user: UserInDB = Depends(check_role([UserRole.CANDIDATE])),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    cursor = db.applications.find({"candidate_id": current_user.id})
    apps = []
    async for app in cursor:
        app = await _enrich_application(app, db)
        apps.append(ApplicationInDB(**app))
    return apps

@router.put("/{application_id}/status", response_model=ApplicationInDB)
async def update_application_status(
    application_id: str,
    status: ApplicationStatus = Body(..., embed=True),
    current_user: UserInDB = Depends(check_role([UserRole.ADMIN, UserRole.HR, UserRole.RECRUITER])),
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
    
    return ApplicationInDB(**updated_app)

@router.post("/public-apply")
@router.post("/public-apply/")
async def public_apply(
    job_id: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Check if job exists (can be "general")
    job = None
    if job_id != "general" and ObjectId.is_valid(job_id):
        job = await db.jobs.find_one({"_id": ObjectId(job_id)})
    
    # Save file
    file_ext = file.filename.split(".")[-1]
    file_name = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    
    # Read file content
    file_content = await file.read()
    
    # Save file to disk
    async with aiofiles.open(file_path, 'wb') as out_file:
        await out_file.write(file_content)
    
    # Extract text and parsed data
    extracted_text = ""
    parsed_candidate_data = {}
    
    try:
        extracted_text = extract_text_from_bytes(file_content, file.filename)
        parsed_candidate_data = extract_candidate_info(extracted_text)
    except Exception as e:
        print(f"Resume extraction error: {e}")
    
    # Scoring
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
    
    if job:
        try:
            scoring_result = await evaluate_application_v2(
                parsed_candidate_data, 
                extracted_text, 
                job
            )
        except Exception as e:
            print(f"Scoring error: {e}")
    
    # Fallback name from filename if extraction fails
    default_name = "New Applicant"
    if not parsed_candidate_data.get("name"):
        base_name = os.path.splitext(file.filename)[0]
        # Clean up filename (remove common words, replace underscores/hyphens)
        clean_name = re.sub(r'[_-\s]+', ' ', base_name)
        clean_name = re.sub(r'(?i)resume|cv|application|final|updated|new', '', clean_name)
        clean_name = clean_name.strip().title()
        if len(clean_name) > 3:
            default_name = clean_name

    application_doc = {
        "job_id": job_id,
        "candidate_id": "public_" + str(uuid.uuid4())[:8],
        "candidate_name": parsed_candidate_data.get("name") or default_name,
        "job_title": job.get("title") if job else "General Pool",
        "resume_file_path": file_path,
        "extracted_text": extracted_text,
        "parsed_data": parsed_candidate_data,
        "scoring": scoring_result,
        "score": scoring_result.get("final_score", 0.0),
        "status": ApplicationStatus.APPLIED.value,
        "applied_at": datetime.utcnow()
    }
    
    result = await db.applications.insert_one(application_doc)
    application_doc["_id"] = str(result.inserted_id)
    
    return {"status": "success", "application_id": str(result.inserted_id), "score": application_doc["score"]}
