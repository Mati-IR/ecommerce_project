from pydantic import BaseModel
from typing import List

class ListingCreateRequestModel(BaseModel):
    creator_id: int
    title: str
    description: str
    price: float
    location: str
    category_id: int
    images: List[str] = []


class AddToBasketRequestModel(BaseModel):
    listing_id: int
    user_id: int