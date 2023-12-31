from fastapi import FastAPI, File, UploadFile, BackgroundTasks, Depends, HTTPException,status,Query
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer,OAuth2AuthorizationCodeBearer,HTTPBasicCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv
from typing import List,Optional
import os
import sys

from services.serveUploadedFiles import handle_upload_image_file, handle_multiple_image_file_uploads, handle_upload_video_file
from services.serveQrcode import handle_qr_code
from services.security.customBearerCheck import validate_token
from services.storage.local import response_image_file
from services.serveDataFromUrl import handle_download_data_from_url, handle_multiple_image_file_downloads

#setup logger
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()
app = FastAPI(docs_url=None if os.environ.get('docs_url') == 'None' else '/docs', redoc_url=None if os.environ.get('redoc_url') == 'None' else '/redoc')

# If you want to serve files from local server you need to mount your static file directory
if os.environ.get('PREFERED_STORAGE') == 'local' and 'pytest' not in sys.modules.keys():
    app.mount("/static", StaticFiles(directory="static"), name="static")

# If you want cors configuration also possible thanks to fast-api
origins = os.environ.get('CORS_ORIGINS').split(',')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["main"])
def root(
    cpu_load: Optional[str] = Query(
        False,
        description='True/False depending your needs, gets average CPU load value',
        regex='^(True|False)$'
        ),
    token: str = Depends(validate_token)):

    result = {
        "Hello": f"Token is {token}",
    }

    if cpu_load == 'True':
        result['cpu_average_load'] = os.getloadavg()
    return result


# File size validates NGINX
@app.post("/image", tags=["image"])
async def upload_image_file(
    thumbnail: Optional[str] = Query(
        os.environ.get('IMAGE_THUMBNAIL'),
        description='True/False depending your needs',
        regex='^(True|False)$'
        ),
    file: UploadFile = File(...),
    OAuth2AuthorizationCodeBearer = Depends(validate_token)):
    return handle_upload_image_file(True if thumbnail == 'True' else False, file)


@app.post("/images", tags=["image"])
async def upload_image_files(
        thumbnail: Optional[str] = Query(
        os.environ.get('IMAGE_THUMBNAIL'),
        description='True/False depending your needs',
        regex='^(True|False)$'
        ),
        files: List[UploadFile] = File(...),
        OAuth2AuthorizationCodeBearer = Depends(validate_token)
    ):
    fileAmount = len(files)
    if fileAmount > int(os.environ.get('MULTIPLE_FILE_UPLOAD_LIMIT')):
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail='Amount of files must not be more than {}'.format(os.environ.get('MULTIPLE_FILE_UPLOAD_LIMIT'))
    )
    return handle_multiple_image_file_uploads(files, fileAmount, True if thumbnail == 'True' else False)


@app.get("/image", tags=["image"])
async def get_image(
    image: str = Query(...,
        description='uploaded image name',
        max_length=50
        ),
    image_type: str = Query(
        ...,
        description='Should provide verision of image you want from localStorage original, thumbnail or qrImage',
        regex='^(original|thumbnail|qrImage)$'
        ),
    OAuth2AuthorizationCodeBearer = Depends(validate_token)
        ):
    logger.info(f"Received request to get image {image} of type {image_type}")
    return response_image_file(image, image_type)


@app.post("/qrImage", tags=["image"])
async def text_to_generate_qr_image(
    qr_text: str = Query(
        ...,
        description='Provide text to generate qr image',
        ),
    with_logo: Optional[str] = Query(
        os.environ.get('QR_IMAGE_WITH_LOGO'),
        description='True/False depending your needs default is {}'.format(os.environ.get('QR_IMAGE_WITH_LOGO')),
        regex='^(True|False)$'
        ),
    OAuth2AuthorizationCodeBearer = Depends(validate_token)):
    return handle_qr_code(qr_text, True if with_logo == 'True' else False)


@app.post("/video", tags=["video"])
async def upload_video_file(
    optimize: Optional[str] = Query(
        os.environ.get('VIDEO_OPTIMIZE'),
        description='True/False depending your needs default is {}'.format(os.environ.get('VIDEO_OPTIMIZE')),
        regex='^(True|False)$'
        ),
    file: UploadFile = File(..., description='Allows mov, mp4, m4a, 3gp, 3g2, mj2'),
    OAuth2AuthorizationCodeBearer = Depends(validate_token)):
    return handle_upload_video_file(True if optimize == 'True' else False, file)


@app.get("/imageUrl", tags=["from url"])
async def image_from_url(
    image_url: str = Query(
        None,
        description = "Pass valid image url to upload",
        min_length  = 5
    ),
    thumbnail: Optional[str] = Query(
        os.environ.get('IMAGE_THUMBNAIL'),
        description='True/False depending your needs',
        regex='^(True|False)$'
    ),
    OAuth2AuthorizationCodeBearer = Depends(validate_token)):
    return handle_download_data_from_url(image_url, True if thumbnail == 'True' else False, file_type='image')


@app.get("/imageUrls", tags=["from url"])
async def images_from_urls(
    image_urls: List[str] = Query(
        None,
        description = "Pass valid image urls to upload",
        min_length  = 5
    ),
    OAuth2AuthorizationCodeBearer = Depends(validate_token)):
    fileAmount = len(image_urls)
    if fileAmount > int(os.environ.get('MULTIPLE_FILE_UPLOAD_LIMIT')):
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail='Amount of files must not be more than {}'.format(os.environ.get('MULTIPLE_FILE_UPLOAD_LIMIT'))
    )
    return handle_multiple_image_file_downloads(image_urls, fileAmount)


@app.get("/videoUrl", tags=["from url"])
async def video_from_url(
    video_url: str = Query(
        None,
        description = "Pass valid video url to upload",
        min_length  = 5
    ),
    optimize: Optional[str] = Query(
        os.environ.get('VIDEO_OPTIMIZE'),
        description='True/False depending your needs default is {}'.format(os.environ.get('VIDEO_OPTIMIZE')),
        regex='^(True|False)$'
        ),
    OAuth2AuthorizationCodeBearer = Depends(validate_token)):
    return handle_download_data_from_url(video_url, False, True if optimize == 'True' else False, file_type='video')