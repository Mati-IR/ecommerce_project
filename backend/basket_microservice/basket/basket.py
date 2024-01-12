from fastapi import HTTPException
from database.query import query_get, query_put
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def add_to_basket(listing_id: int, user_id: int):
    """
    This add_to_basket API allow you to add product into your basket.
    """

    # Check if listing is not already in basket
    basketListings = get_basket(user_id)

    for basketListing in basketListings:
        if basketListing['listing_id'] == listing_id:
            return True
        
    query_put(
        """
        INSERT INTO basket (user_id, listing_id)
        VALUES (%s, %s)
        """,
        (user_id, listing_id)
    )
    
    basketListings = get_basket(user_id)
    logger.info(f'basketListings: {basketListings}')
    for basketListing in basketListings:
        if basketListing['listing_id'] == listing_id:
            return True
    raise HTTPException(status_code=500, detail='Error in add_to_basket, listing not found in basket.')
    
def get_basket(user_id: int):
    """
    This get_basket API allow you to get your basket.
    """
    basketListings = query_get(
        """
        SELECT listing_id FROM basket WHERE user_id = %s
        """,
        (user_id)
    )
    return basketListings

def remove_from_basket(listing_id: int, user_id: int):
    """
    This remove_from_basket API allow you to remove product from your basket.
    """
    query_put(
        """
        DELETE FROM basket WHERE listing_id = %s AND user_id = %s
        """,
        (listing_id, user_id)
    )
    
    basketListings = get_basket(user_id)
    if listing_id not in basketListings:
        return True
    else:
        raise HTTPException(status_code=500, detail='Error in remove_from_basket, listing still found in basket.')
    
def remove_from_basket_all_users(listing_id: int):
    """
    This remove_from_basket_all_users API allow you to remove product from all users' basket.
    """
    query_put(
        """
        DELETE FROM basket WHERE listing_id = %s
        """,
        (listing_id)
    )
    
    return True