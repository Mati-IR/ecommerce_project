from pydantic import BaseModel, EmailStr


class recommendationByCategoryRequestModel(BaseModel):
    category_id: int
    product_count: int