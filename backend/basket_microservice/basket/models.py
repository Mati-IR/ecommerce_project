from pydantic import BaseModel, EmailStr


class AddToBasketRequestModel(BaseModel):
    listing_id: int
    user_id: int