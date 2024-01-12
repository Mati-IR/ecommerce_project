from fastapi import HTTPException
from .models import ListingCreateRequestModel, Category
from database.query import query_get, query_put, query_update
from fastapi.datastructures import FormData
from fastapi import File, UploadFile
from typing import List
import base64

#setup logger
import logging
logging.basicConfig(level=logging.DEBUG)
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

def upload_file(listing_id, file_name: str, storage: str):
    logger.debug(f"crud.upload_file Received request to upload file {file_name} of type {storage} for listing_id: {listing_id}")
    query_put("""
                    INSERT INTO listing_photos (
                        listing_id,
                        photo_name,
                        storage
                    ) VALUES (%s,%s, %s);
                    """,
                  (
                        listing_id,
                        file_name,
                        storage
                  )
                  )

def get_listing_images(listing_id):
    logger.debug(f"crud.get_listing_images Received request to get listing images for listing_id: {listing_id}")
    photos =  query_get("""
                    SELECT
                        photo_name,
                        storage
                    FROM listing_photos
                    WHERE listing_id = %s;
                    """,
                     (listing_id,)
                     )
    logger.debug(f"crud.get_listing_images photos: {photos}")
    return photos

def get_amount_of_images(listing_id):
    logger.info(f"crud.get_amount_of_images Received request to get amount of listing images for listing_id: {listing_id}")
    
    result = query_get("""
        SELECT COUNT(*) AS image_count
        FROM listing_photos
        WHERE listing_id = %s;
        """,
        (listing_id,)
    )
    
    amount = result[0]['image_count'] if result else 0
    
    logger.debug(f"crud.get_amount_of_images amount: {amount}")
    return amount

def get_listings_created_by(user):
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
                    WHERE creator_id = %s;
                    """,
                     (user,)
                     )
def delete_listing(listing_id):
    return query_put("""
                    DELETE FROM listings
                    WHERE id = %s;
                    """,
                     (listing_id,)
                     )