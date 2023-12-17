from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from listing import models, crud
from listing.models import ListingCreateRequestModel
import logging

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:8000",
    "http://127.0.0.1:8001",
    "http://localhost:8080",
    "http://127.0.0.1",
    # Add other origins if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.get("/listing/{listing_id}")
def read_listing(listing_id: int):
    db_listing = crud.get_listing_by_id(listing_id=listing_id)
    if db_listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    return db_listing

@app.get("/listings/{listings_ids}")
def read_listings(listings_ids: str):
    listings_ids = listings_ids.split(",")
    db_listings = crud.get_listings_by_ids(listings_ids=listings_ids)
    if db_listings is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    return db_listings

@app.post("/listings/create", response_model=int)
def create_listing(listing: ListingCreateRequestModel) -> int:
    # Log the request content
    logger.info(f"Received request to create listing: {listing.json()}")
    logger.info(f"Listing in original model: {listing}")
    try:
        new_listing_id = crud.create_listing(listing)
        # print type and value of new_listing_id
        logger.info(f"new_listing_id: {type(new_listing_id)}")
        logger.info(f"new_listing_id: {new_listing_id}")
        return new_listing_id
    except Exception as e:
        logger.error(f"Error in create_listing: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/categories")
def get_categories():
    # Logic to fetch categories from the database
    categories = crud.get_all_categories()
    print(categories)
    return categories