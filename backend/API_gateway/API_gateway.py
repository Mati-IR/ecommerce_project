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

@app.get("/")
def read_root():
    return {"message": "Hello, this is my custom message!"}

@app.get("/test")
def test_connection():
    return {"status": "success", "message": "Connected successfully!"}
