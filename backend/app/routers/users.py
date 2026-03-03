from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
import aiofiles
import os
import uuid
from typing import List
from app.core.deps import check_role, get_db, get_current_active_user
from app.schemas.user import UserInDB, UserCreate, UserRole, UserUpdate
from app.core.security import get_password_hash
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from bson import ObjectId

router = APIRouter()

@router.get("/", response_model=List[UserInDB])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    current_user: UserInDB = Depends(check_role([UserRole.ADMIN, UserRole.HR])),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    query = {}
    if current_user.role == UserRole.HR:
        # HR can only see recruiters
        query = {"role": UserRole.RECRUITER.value}
    
    cursor = db.users.find(query).skip(skip).limit(limit)
    users_list = []
    async for user in cursor:
        user["_id"] = str(user["_id"])
        users_list.append(UserInDB(**user))
    return users_list

@router.post("/", response_model=UserInDB)
async def create_user(
    user_in: UserCreate,
    current_user: UserInDB = Depends(check_role([UserRole.ADMIN, UserRole.HR])),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Validation for HR
    if current_user.role == UserRole.HR:
        if user_in.role != UserRole.RECRUITER:
            raise HTTPException(
                status_code=403,
                detail="HR can only create Recruiter accounts"
            )

    user = await db.users.find_one({"email": user_in.email})
    if user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )
    
    user_doc = user_in.dict()
    user_doc["password_hash"] = get_password_hash(user_in.password)
    del user_doc["password"]
    user_doc["created_at"] = datetime.utcnow()
    
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = str(result.inserted_id)
    return UserInDB(**user_doc)

@router.get("/me", response_model=UserInDB)
async def read_current_user(
    current_user: UserInDB = Depends(get_current_active_user)
):
    return current_user

@router.put("/me", response_model=UserInDB)
async def update_current_user(
    user_update: UserUpdate,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if current_user.id == "admin-static":
        raise HTTPException(status_code=400, detail="Admin profile cannot be updated")

    update_doc = user_update.dict(exclude_unset=True)
    if "password" in update_doc:
        update_doc["password_hash"] = get_password_hash(update_doc.pop("password"))

    if not update_doc:
        return current_user

    await db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": update_doc}
    )

    updated_user = await db.users.find_one({"_id": ObjectId(current_user.id)})
    updated_user["_id"] = str(updated_user["_id"])
    return UserInDB(**updated_user)

@router.post("/me/photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if current_user.id == "admin-static":
        raise HTTPException(status_code=400, detail="Admin profile cannot be updated")

    # Double check directory exists
    os.makedirs("profiles", exist_ok=True)
    
    file_ext = file.filename.split(".")[-1]
    file_name = f"{current_user.id}_{uuid.uuid4().hex[:8]}.{file_ext}"
    file_path = f"profiles/{file_name}"

    async with aiofiles.open(file_path, "wb") as buffer:
        content = await file.read()
        await buffer.write(content)

    await db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": {"profile_photo": file_path}}
    )

    return {"profile_photo": file_path}

@router.delete("/me")
async def delete_current_user(
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if current_user.id == "admin-static":
        raise HTTPException(status_code=400, detail="Admin account cannot be deleted")

    await db.users.delete_one({"_id": ObjectId(current_user.id)})
    return {"message": "Account deleted successfully"}

@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user: UserInDB = Depends(check_role([UserRole.ADMIN, UserRole.HR])),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")

    user_to_delete = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user_to_delete:
        raise HTTPException(status_code=404, detail="User not found")
        
    if current_user.role == UserRole.HR:
        if user_to_delete.get("role") != UserRole.RECRUITER.value:
            raise HTTPException(
                status_code=403,
                detail="HR can only delete Recruiter accounts"
            )

    await db.users.delete_one({"_id": ObjectId(user_id)})
    return {"message": "User deleted successfully"}
