from fastapi import FastAPI, HTTPException, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.responses import JSONResponse
from basket import add_to_basket, get_basket, remove_from_basket, remove_from_basket_all_users
from basket import AddToBasketRequestModel

app = FastAPI()

origins = [
    "host.docker.internal",
    "host.docker.internal:8000",
    "host.docker.internal:3000",
    "host.docker.internal:3001",
    "host.docker.internal:4000",
    "host.docker.internal:19006"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
################################
######### basket APIs ##########
################################

@app.post('/add_product')
def add_product_api(product: AddToBasketRequestModel):
    """
    This add_product API allow you to add product into your basket.
    """
    productAdded = add_to_basket(product.listing_id, product.user_id)
    if productAdded:
        return JSONResponse(
            status_code=200,
            content={"message": "Product added to basket successfully."}
        )

@app.get('/get_basket/{user_id}')
def get_basket_api(user_id: int):
    """
    This get_basket API allow you to get your basket.
    """
    return get_basket(user_id)

@app.delete('/remove_product')
def remove_product_api(product : AddToBasketRequestModel):
    """
    This remove_product API allow you to remove product from your basket.
    """
    productRemoved = remove_from_basket(product.listing_id, product.user_id)
    if productRemoved:
        return JSONResponse(
            status_code=200,
            content={"message": "Product removed from basket successfully."}
        )

@app.delete('/remove_product_all_users/{listing_id}')
def remove_product_all_users_api(listing_id: int):
    """
    This remove_product_all_users API allow you to remove product from all users' basket.
    """
    productRemoved = remove_from_basket_all_users(listing_id)
    if productRemoved:
        return JSONResponse(
            status_code=200,
            content={"message": "Product removed from all users' basket successfully."}
        )
###############################
########## Test APIs ##########

@app.get("/test")
def test_connection():
    return {"status": "success", "message": "MVC_basket - Connected successfully!"}