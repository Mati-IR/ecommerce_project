from pydantic import BaseModel
from typing import List
from fastapi import File, UploadFile

class ListingCreateRequestModel(BaseModel):
    creator_id: int
    title: str
    description: str
    price: str
    location: str
    category_id: int
    # images: List[UploadFile] = File(...)


class AddToBasketRequestModel(BaseModel):
    listing_id: int
    user_id: int