import httpx
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from user import SignInRequestModel, SignUpRequestModel, UserAuthResponseModel, UserUpdateRequestModel, UserResponseModel

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
    "identity": "http://host.docker.internal:8001"
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
                "token": data["token"],
                "user": data["user"]
            }
        else:
            # Raise an HTTP exception with the error details from the identity microservice
            details = response.json()
            raise HTTPException(status_code=response.status_code, detail=details)