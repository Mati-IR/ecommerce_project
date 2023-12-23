import httpx
import logging

import uvicorn
from fastapi import FastAPI, HTTPException, Depends, Request, File, UploadFile, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.datastructures import FormData
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from listing import ListingCreateRequestModel, AddToBasketRequestModel
from typing import List, Any, Annotated
from user import SignInRequestModel, SignUpRequestModel, UserAuthResponseModel, UserUpdateRequestModel, UserResponseModel
import json
import os
import uuid
import multipart
import logging.config

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
    return {"message": "Hello, this is API Gateway!"}

@app.get("/test")
def test_connection():
    return {"status": "success", "message": "Connected successfully!"}

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
	exc_str = f'{exc}'.replace('\n', ' ').replace('   ', ' ')
	logging.error(f"{request}: {exc_str}")
	content = {'status_code': 10422, 'message': exc_str, 'data': None}
	return JSONResponse(content=content, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)


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

from fastapi import File, UploadFile

@app.post("/create_listing")
async def create_listing(
    request: Request,
    listing_details: ListingCreateRequestModel
):
    try:
        # Your existing code for processing the request

        return {"status": "success", "message": "Listing created successfully!"}

    except Exception as e:
        # Log the request payload in case of a validation failure
        logger.error(f"Validation failed. Request payload: {await request.body()}")
        raise
    # Log the request content
    logger.info(f"Received request to create listing: {listing_details.json()}")
    logger.info(f"Listing in original model: {listing_details}")

    # Convert listing_details to a dictionary
    listing_data = listing_details.dict()

    # Add the listing details to the FormData
    form_data = FormData()
    form_data.add_field(name="listing_data", value=json.dumps(listing_data), content_type="application/json")

    # Add each image to the FormData
    for image in images:
        form_data.add_field(name="images", value=image.file, filename=image.filename)

    # Send the request to the listings microservice
    async with httpx.AsyncClient() as client:
        response = await client.post(
            microservices["listings"] + "/listings/create",
            files=form_data,
        )

        logger.info(f'Response from listing microservice: {response}')
        logger.info(f'Response.json(): {response.json()}')

        if response.status_code == 200:
            # Extract the id from the JSON response
            listing_id = response.json()["listing_id"]
            logger.info(f'Listing created successfully! ID: {listing_id}')
            return {
                "status": "success",
                "message": "Listing created successfully!",
                "listing": listing_id,
            }
        else:
            # Raise an HTTP exception with the error details from the listings microservice
            details = response.json()
            raise HTTPException(status_code=response.status_code, detail=details)

# Helper function to generate a unique filename
def generate_unique_filename(listing_id: int, file_extension: str) -> str:
    unique_id = str(uuid.uuid4())
    return f"{listing_id}_{unique_id}.{file_extension}"

# Endpoint to handle file uploads for a listing
@app.post("/upload_photos")
async def upload_photos(fileb: UploadFile = File(None)):
    return {"filename": fileb.filename}

@app.post("/uploadfile/")
async def create_upload_file(file: UploadFile):
    return {"filename": file.filename}

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
        response = await client.get(microservices["listings"] + f"/listing/{listing_id}")
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
    
@app.get("/listingsByCategory/{category_id}/{product_count}")
async def get_listings_by_category(request: Request, category_id: int, product_count: int):
    async with httpx.AsyncClient() as client:
        recommendations = await client.get(f"{microservices['recommendation']}/recommendationByCategory", params={"category_id": int(category_id), "product_count": int(product_count)}, timeout=30)
        logging.info(f"recommendations: {recommendations.json()}")
        ids = ",".join([str(r["id"]) for r in recommendations.json()])
        logging.info(f"ids: {ids}")
        response = await client.get(f"{microservices['listings']}/listings/{ids}", timeout=30)
        return response.json()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

