import httpx

import uvicorn
from fastapi import FastAPI, HTTPException, Depends, Request, File, UploadFile, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.datastructures import FormData
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, FileResponse, StreamingResponse
import io
from listing import ListingCreateRequestModel, AddToBasketRequestModel
from typing import List, Any, Annotated
from user import SignInRequestModel, SignUpRequestModel, UserAuthResponseModel, UserUpdateRequestModel, UserResponseModel
import json
import os
import uuid
import multipart
from fastapi.security import OAuth2AuthorizationCodeBearer

#setup logger
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

FILE_MANAGER_KEY = os.environ.get("FILE_MANAGER_KEY")

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
    "recommendation":    "http://host.docker.internal:8004",
    "file_manager":      "http://host.docker.internal:8080",
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
            microservices["identity"] + "/signin",
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
                microservices["identity"] + "/signup",
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

@app.get("/get_user/{user_id}")
async def get_user(request: Request, user_id: int):
    # call identity microservice
    async with httpx.AsyncClient() as client:
        # get user from identity microservice by provided login and password
        response = await client.get(
            microservices["identity"] + f"/user/{user_id}",
        )
        return response.json()

@app.put("/update_user")
async def update_user(request: Request, user_details: UserUpdateRequestModel):
    # call identity microservice
    async with httpx.AsyncClient() as client:
        # get user from identity microservice by provided login and password
        response = await client.put(
            microservices["identity"] + "/user/update",
            json=user_details.dict()
        )
        return response.json()

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

# Helper function to generate a unique filename
def generate_unique_filename(listing_id: int, file_extension: str) -> str:
    unique_id = str(uuid.uuid4())
    return f"{listing_id}_{unique_id}.{file_extension}"

@app.post("/uploadfile/{listing_id}")
async def create_upload_file(file: UploadFile, listing_id: int):
    # send file to listings microservice
    file_manager_response = None
    # upload file to file manager microservice
    try:
        async with httpx.AsyncClient() as client:
            file_manager_response = await client.post(
            microservices["file_manager"] + f"/image",
            data={'thumbnail': 'False'},
            files={'file': (file.filename, file.file)},
            headers={'Authorization': f'Bearer {FILE_MANAGER_KEY}'},
        )

        # wait for response
        file_manager_response.raise_for_status()
        # print contents of response
        logger.info(f'response from file manager microservice: {file_manager_response.json()}')
    except httpx.RequestError as exc:
        raise HTTPException(status_code=500, detail=f"Error communicating with file manager: {exc}, details: {exc.__dict__}")
    
    # send file details to listings microservice
    # @app.post("/listings/saveFileData/{listing_id}")
    # def create_upload_file(listing_id: int, file_name: str, file_type: str):

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
            microservices["listings"] + f"/listings/saveFileData/{listing_id}",
            params={'file_name': file_manager_response.json()['file_name'], 'storage': file_manager_response.json()['storage']},
        )

        # wait for response
        response.raise_for_status()
        # print contents of response
        logger.debug(f'response from listings microservice: {response.json()}')
    except httpx.RequestError as exc:
        raise HTTPException(status_code=500, detail=f"Error communicating with listings: {exc}, details: {exc.__dict__}")
    
    return response.json()

@app.get("/listings/{listing_id}/{img_idx}/image")
async def get_listing_image(request: Request, listing_id: int, img_idx: int):
    # get file_name and storage type from listings microservice
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
            microservices["listings"] + f"/listings/{listing_id}/images",
        )

        # wait for response
        response.raise_for_status()
        # print contents of response
        logger.info(f'response from listings microservice: {response.json()}')
    except httpx.RequestError as exc:
        raise HTTPException(status_code=500, detail=f"Error communicating with listings: {exc}, details: {exc.__dict__}")
    
    if len(response.json()) == 0:
        raise HTTPException(status_code=404, detail=f"Photos for listing with ID {listing_id} not found")
    
    file_data = response.json()
    photos = []
    logger.info(f'files: {file_data}')
    # get file from file manager microservice
    #for file in file_data:
    try:
        # logger.info(f'attempting to get file: {file_data[0]} of type: {file["storage"]}')
        async with httpx.AsyncClient() as client:
            file_manager_response = await client.get(
            microservices["file_manager"] + f"/image",
            params={'image': file_data[img_idx]['photo_name'], 'image_type': 'original'},
            headers={'Authorization': f'Bearer {FILE_MANAGER_KEY}'},
        )
        # Check if the response is successful
        file_manager_response.raise_for_status()
        # logger.info(f'file_manager_response: {file_manager_response}')
        # logger.info(f'file_manager_response content: {file_manager_response.content}')

        # Return the file
        return StreamingResponse(io.BytesIO(file_manager_response.content), media_type="image/png")
    except httpx.RequestError as exc:
        logger.error(f'Error getting photo from file manager: {exc}')
        raise HTTPException(status_code=500, detail=f"Error communicating with file manager: {exc}")
    except ValueError as exc:
        logger.error(f'Error handling file path: {exc}')
        raise HTTPException(status_code=500, detail=f"Error handling file path: {exc}")

@app.get("/amount_of_images/{listing_id}")
async def get_amount_of_images(request: Request, listing_id: int):
    # get file_name and storage type from listings microservice
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
            microservices["listings"] + f"/amount_of_images/{listing_id}",
        )

        # wait for response
        response.raise_for_status()
        # print contents of response
        logger.debug(f'response from listings microservice: {response.json()}')
    except httpx.RequestError as exc:
        raise HTTPException(status_code=500, detail=f"Error communicating with listings: {exc}, details: {exc.__dict__}")
    
    #if len(response.json()) == 0:
    #    raise HTTPException(status_code=404, detail=f"Photos for listing with ID {listing_id} not found")
    
    file_data = response.json()
    return response.json()

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

@app.get("/listings_created_by/{user}")
async def get_listings_created_by(request: Request, user: str):
    # Forward the request to the listings microservice
    async with httpx.AsyncClient() as client:
        response = await client.get(microservices["listings"] + f"/listings_created_by/{user}")
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
    
@app.delete("/basket/remove_product/{listing_id}/{user_id}")
async def remove_product(listing_id: int, user_id: int, request: Request):
    async with httpx.AsyncClient() as client:
        data = {"listing_id": listing_id, "user_id": user_id}
        response = await client.request("DELETE", microservices["basket"] + f"/remove_product", json=data)
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

# remove listing by ID
@app.delete("/listings/{listing_id}")
async def remove_listing_by_id(request: Request, listing_id: int):
    # Todo implement file deletion from file manager
    return_response = None
    # Forward the request to the listings microservice
    async with httpx.AsyncClient() as client:
        response = await client.delete(microservices["listings"] + f"/listing/{listing_id}")
        return_response = response.json()

    async with httpx.AsyncClient() as client:
        response = await client.delete(microservices["basket"] + f"/remove_product_all_users/{listing_id}")
        if response.status_code != 200:
            return_response = response.json()

    return return_response

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

