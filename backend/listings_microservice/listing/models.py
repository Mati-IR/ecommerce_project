from pydantic import BaseModel

class ListingCreateRequestModel(BaseModel):
    creator_id: int
    title: str
    description: str
    price: float
    location: str
    category_id: int

class Category(BaseModel):
    id: int
    name: str
    description: str