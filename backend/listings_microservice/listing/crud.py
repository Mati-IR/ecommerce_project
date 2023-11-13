from fastapi import HTTPException
from .models import ListingCreateRequestModel
from database.query import query_get, query_put, query_update

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
    if len(listing) == 0:
        raise HTTPException(status_code=500, detail='Error in create_listing->get_listing_by_title, listing not found.')
    else:
        return listing[0]


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