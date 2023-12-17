from fastapi import FastAPI, HTTPException, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.responses import JSONResponse
from recommendation import getRecommendationsByCategory, getRandomRecommendations
from recommendation import recommendationByCategoryRequestModel

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
########################################
######### recommendation APIs ##########
########################################

@app.get("/recommendationByCategory")
def getRecommendationByCategory(category_id: int, product_count: int):
    return getRecommendationsByCategory(category_id, product_count)

@app.get("/recommendationRandom")
def getRecommendation(count: int):
    return getRandomRecommendations(count)


###############################
########## Test APIs ##########

@app.get("/test")
def test_connection():
    return {"status": "success", "message": "MVC_recommendation - Connected successfully!"}