from pydantic import BaseModel, EmailStr


class SignInRequestModel(BaseModel):
    email: str
    password: str


class SignUpRequestModel(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserUpdateRequestModel(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str


class UserResponseModel(BaseModel):
    id: int
    email: EmailStr
    name: str


class TokenModel(BaseModel):
    access_token: str
    refresh_token: str


class UserAuthResponseModel(BaseModel):
    token: TokenModel
    user: UserResponseModel
