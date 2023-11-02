import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
    "identity": "http://localhost:8001"
}

@app.get("/")
def read_root():
    return {"message": "Hello, this is my custom message!"}

@app.get("/test")
def test_connection():
    return {"status": "success", "message": "Connected successfully!"}

@app.get("/login")
async def login():

# call identity mcroservice
    async with httpx.AsyncClient() as client:
        # get user from identity microservice by provided login and password
        response = await client.get(microservices["identity"] + "/users/1")
        if response.status_code == 200:
            return {"status": "success", "message": "Login successful!"}
        else:
            return response.json()
