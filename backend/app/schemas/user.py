from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    HR = "hr"
    RECRUITER = "recruiter"
    CANDIDATE = "candidate"

class UserPreferences(BaseModel):
    theme: str = "light"
    language: str = "en"
    timezone: str = "ist"
    date_format: str = "dd/mm/yyyy"
    compact_mode: bool = False
    animations_enabled: bool = True

class NotificationSettings(BaseModel):
    new_applicants: bool = True
    interviews: bool = True
    status_updates: bool = True
    weekly_report: bool = False

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: UserRole = UserRole.CANDIDATE
    profile_photo: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    company: Optional[str] = None
    domain: Optional[str] = None
    preferences: UserPreferences = Field(default_factory=UserPreferences)
    notifications: NotificationSettings = Field(default_factory=NotificationSettings)

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    company: Optional[str] = None
    domain: Optional[str] = None
    preferences: Optional[UserPreferences] = None
    notifications: Optional[NotificationSettings] = None

class UserInDB(UserBase):
    id: str = Field(alias="_id")
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
