from fastapi import HTTPException
from database.query import query_get, query_put
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def getRecommendationsByCategory(category_id: int, product_count: int):
    """
    This getRecommendationsByCategory API allow you to get recommendations by category.
    """
    recommendedProducts = query_get(
        """
        SELECT id FROM listings WHERE category_id = %s ORDER BY RAND() LIMIT %s
        """,
        (category_id, product_count)
    )
    logger.info(f'recommendedProducts: {recommendedProducts}')
    return recommendedProducts

def getRandomRecommendations(product_count: int):
    """
    This getRandomRecommendations API allow you to get random recommendations.
    """
    recommendedProducts = query_get(
        """
        SELECT
             id,
             creator_id,
             creation_date,
             title,
             description,
             price,
             location,
             category_id
         FROM listings ORDER BY RAND() LIMIT %s
        """,
        (product_count)
    )
    logger.info(f'recommendedProducts: {recommendedProducts}')
    return recommendedProducts