from fastapi import FastAPI
from listing import models, crud

app = FastAPI()


@app.get("/listings/{listing_id}")
def read_listing(listing_id: int):
    db_listing = crud.get_listing_by_id(listing_id=listing_id)
    if db_listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    return db_listing

@app.post("/listings/", response_model=models.ListingCreateRequestModel)
def create_listing(listing: models.ListingCreateRequestModel):
    return crud.create_listing(listing=listing)
