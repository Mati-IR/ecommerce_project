from fastapi import HTTPException
from .models import ListingCreateRequestModel, Category
from database.query import query_get, query_put, query_update
from fastapi.datastructures import FormData
from fastapi import File, UploadFile
from typing import List

#setup logger
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_listing_by_title(title, creator_id):
    return query_get("""
                    SELECT
                        id,
                        creator_id,
                        creation_date,
                        title,
                        description,
                        price,
                        location,
                        category_id
                    FROM listings
                    WHERE title = %s AND creator_id = %s;
                    """,
                     (title, creator_id)
                     )

def create_listing(listing_model: ListingCreateRequestModel):
    logger.info(f"crud.create_listing Received request to create listing: {listing_model.json()}")
    query_put("""
                    INSERT INTO listings (
                        creator_id,
                        title,
                        description,
                        price,
                        location,
                        category_id
                    ) VALUES (%s,%s,%s,%s,%s,%s);
                    """,
                  (
                        listing_model.creator_id,
                        listing_model.title,
                        listing_model.description,
                        listing_model.price,
                        listing_model.location,
                        listing_model.category_id
                  )
                  )
    listing = get_listing_by_title(listing_model.title, listing_model.creator_id)
    logger.info(f"crud.create_listing listing in original model: {listing}")
    if len(listing) == 0:
        logger.error("Error in create_listing->get_listing_by_title, listing not found.")
        raise HTTPException(status_code=500, detail='Error in create_listing->get_listing_by_title, listing not found.')
    else:
        id = int(listing[0]['id'])
        logger.info(f"returned id: {id}")
        return id

def get_listing_by_id(listing_id):
    return query_get("""
                    SELECT
                        id,
                        creator_id,
                        creation_date,
                        title,
                        description,
                        price,
                        location,
                        category_id
                    FROM listings
                    WHERE id = %s;
                    """,
                     (listing_id,)
                     )

def get_listings_by_ids(listings_ids):
    return query_get("""
                    SELECT
                        id,
                        creator_id,
                        creation_date,
                        title,
                        description,
                        price,
                        location,
                        category_id
                    FROM listings
                    WHERE id IN %s;
                    """,
                     (listings_ids,)
                     )

def get_all_categories():
    # Database query to fetch all categories
    return query_get("SELECT id, name, description FROM categories;", None)

# Function to upload photos to FTP server
def upload_photos_to_ftp(images: List[UploadFile], ftp_directory: str):
    # FTP server connection details
    ftp_host = "your_ftp_host"
    ftp_user = "your_ftp_user"
    ftp_password = "your_ftp_password"

    # Connect to FTP server
    with FTP(ftp_host) as ftp:
        ftp.login(user=ftp_user, passwd=ftp_password)

        # Create directory if it doesn't exist
        ftp.mkd(ftp_directory)

        # Change to the specified directory
        ftp.cwd(ftp_directory)

        # Upload each image to the FTP server
        for image in images:
            with image.file as file:
                ftp.storbinary(f"STOR {image.filename}", file)

def upload_file(listing_id, file: bytes):
    logger.info(f"crud.upload_file Received request to upload file for listing_id: {listing_id}")
    query_put("""
                    INSERT INTO listing_photos (
                        listing_id,
                        photo
                    ) VALUES (%s,%s);
                    """,
                  (
                        listing_id,
                        file
                  )
                  )

def get_listing_photos(listing_id):
    return query_get("""
                    SELECT
                        photo
                    FROM listing_photos
                    WHERE listing_id = %s;
                    """,
                     (listing_id,)
                     )