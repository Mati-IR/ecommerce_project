from pydantic import BaseModel
from typing import Optional  # Import Optional for Optional[str]

class UserBase(BaseModel):
    name: str
    email: str
    phone: int
    city: str
    postal_code: str
    street: str
    street_number: int
    website: Optional[str]  # Use Optional[str] for fields that can be None

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int

class UserPasswordBase(BaseModel):
    user_id: int
    password_hash: str

class UserPasswordCreate(UserPasswordBase):
    pass

class UserPassword(UserPasswordBase):
    id: int

