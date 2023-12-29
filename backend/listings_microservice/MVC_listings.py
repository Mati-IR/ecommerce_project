from fastapi import FastAPI, File, UploadFile, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from listing import models, crud
from listing.models import ListingCreateRequestModel
import logging
from fastapi.datastructures import FormData
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError


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

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
	exc_str = f'{exc}'.replace('\n', ' ').replace('   ', ' ')
	logging.error(f"{request}: {exc_str}")
	content = {'status_code': 10422, 'message': exc_str, 'data': None}
	return JSONResponse(content=content, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

# Function to get category name based on category_id
def get_category_name(category_id: int):
    # Fetch categories from the database
    categories = crud.get_all_categories()

    # Find the category with the matching category_id
    category = next((cat for cat in categories if cat["id"] == category_id), None)

    # Return the category name if found, or raise an exception
    if category:
        return category["name"]
    else:
        raise HTTPException(status_code=404, detail="Category not found")

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

@app.post("/listings/uploadfile/{listing_id}")
def create_upload_file(listing_id: int, file: UploadFile = File(...)):
    # Log the request content
    # logger.info(f"Received request to upload file for listing_id: {listing_id}")
    # logger.info(f"Received request to upload file: {file.filename}")
    try:
        crud.upload_file(listing_id, file)
        return {"message": "File uploaded successfully"}
    except Exception as e:
        logger.error(f"Error in create_upload_file: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/listings/{listing_id}/images")
def get_listing_images(listing_id: int):
    try:
        images = crud.get_listing_images(listing_id)
        # logger.info(f"images: {images}")
        # print type and value of images
        logger.info(f"images: {type(images)}")
        logger.info(f"images: {images}")
        return images
    except Exception as e:
        logger.error(f"Error in get_listing_images: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# returns id, name, description
@app.get("/categories")
def get_categories():
    # Logic to fetch categories from the database
    categories = crud.get_all_categories()
    print(categories)
    return categories