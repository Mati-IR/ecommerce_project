import httpx
import logging

import uvicorn
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from user import SignInRequestModel, SignUpRequestModel, UserAuthResponseModel, UserUpdateRequestModel, UserResponseModel
from listing import ListingCreateRequestModel, AddToBasketRequestModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://127.0.0.1:8000",
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

microservices = {
    "identity":          "http://host.docker.internal:8001",
    "listings":          "http://host.docker.internal:8002",
    "basket":            "http://host.docker.internal:8003",
    "recommendation":    "http://host.docker.internal:8004"
}

@app.get("/")
def read_root():
    return {"message": "Hello, this is my custom message!"}

@app.get("/test")
def test_connection():
    return {"status": "success", "message": "Connected successfully!"}

@app.post("/login")
async def login(request: Request, user_details: SignInRequestModel):

    # call identity microservice
    async with httpx.AsyncClient() as client:
        # get user from identity microservice by provided login and password
        response = await client.post(
            microservices["identity"] + "/v1/signin",
            json=user_details.dict()
        )

        if response.status_code == 200:
            # Extract the token and user details from the response
            data = response.json()
            return {
                "status": "success",
                "message": "Login successful!",
                "access_token": data["token"]["access_token"],  # Adjusted to match nested structure
                "refresh_token": data["token"]["refresh_token"],  # Adjusted to match nested structure
                "user": data["user"]
            }
        else:
            # Raise an HTTP exception with the error details from the identity microservice
            details = response.json()
            raise HTTPException(status_code=response.status_code, detail=details)

@app.post("/register")
async def register(request: Request, user_details: SignUpRequestModel):
        logging.info(f"Received registration request for email: {user_details.email}")
        # call identity microservice
        async with httpx.AsyncClient() as client:
            # get user from identity microservice by provided login and password
            response = await client.post(
                microservices["identity"] + "/v1/signup",
                json=user_details.dict()
            )

            if response.status_code == 200:
                # Extract the token and user details from the response
                data = response.json()
                return {
                    "status": "success",
                    "message": "Registration successful!",
                    "token": data["token"],
                    "user": data["user"]
                }
            else:
                # log detailed error message
                logging.error(f"Error while registering user: {response.json()}")
                # Raise an HTTP exception with the error details from the identity microservice
                details = response.json()
                raise HTTPException(status_code=response.status_code, detail=details)

@app.post("/create_listing")
async def create_listing(request: Request, listing_details: ListingCreateRequestModel):
    # call listing microservice
    async with httpx.AsyncClient() as client:
        # get user from identity microservice by provided login and password
        response = await client.post(
            microservices["listings"] + "/listings/create",
            json=listing_details.dict()
        )
        logger.info(f'response from listing microservice: {response}')
        # print contents of response
        logger.info(f'response.json(): {response.json()}')
        if response.status_code == 200:
            # Extract the id from json response
            listing_id = response.json()
            logger.info(f'Listing created successfully! ID: {listing_id}')
            return {
                "status": "success",
                "message": "Listing created successfully!",
                "listing": listing_id
            }
        else:
            # Raise an HTTP exception with the error details from the identity microservice
            details = response.json()
            raise HTTPException(status_code=response.status_code, detail=details)
        
@app.get("/categories")
async def get_categories():
    # Forward the request to the listings microservice
    async with httpx.AsyncClient() as client:
        response = await client.get(microservices["listings"] + "/categories")
        return response.json()
    

# get listing by ID
@app.get("/listings/{listing_id}")
async def get_listing_by_id(request: Request, listing_id: int):
    # Forward the request to the listings microservice
    async with httpx.AsyncClient() as client:
        response = await client.get(microservices["listings"] + f"/listings/{listing_id}")
        return response.json()
    
@app.get("/basket/{user_id}")
async def get_basket(request: Request, user_id: int):
    # Forward the request to the basket microservice
    async with httpx.AsyncClient() as client:
        response = await client.get(microservices["basket"] + f"/get_basket/{user_id}")
        return response.json()
    
@app.post("/basket/add_product/{listing_id}/{user_id}")
async def add_product(request: Request, listing_id: int, user_id: int):
    async with httpx.AsyncClient() as client:
        response = await client.post(microservices["basket"] + f"/add_product", json={"listing_id": listing_id, "user_id": user_id})
        return response.json()
    
@app.get("/recommendationRandom/{count}")
async def get_recommendation(request: Request, count: int):
    async with httpx.AsyncClient() as client:
        response = await client.get(microservices["recommendation"] + f"/recommendationRandom", params={"count": count})
        return response.json()
    
@app.get("/recommendationByCategory/{category_id}/{product_count}")
async def get_recommendation(request: Request, category_id: int, product_count: int):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{microservices['recommendation']}/recommendationByCategory", params={"category_id": category_id, "product_count": product_count})
        return response.json()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

