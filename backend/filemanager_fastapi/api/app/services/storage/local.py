import os
from pathlib import Path
from fastapi.responses import FileResponse
from fastapi import HTTPException,status

#setup logger
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def response_image_file(filename:str, image_type:str):
    validPath = {
        'original': os.environ.get('IMAGE_ORIGINAL_LOCAL_PATH'),
        'thumbnail': os.environ.get('IMAGE_THUMBNAIL_LOCAL_PATH'),
        'qrImage': os.environ.get('QR_IMAGE_LOCAL_PATH'),
        }

    if not Path(validPath[image_type] + filename).is_file():
        logger.error(f'{validPath[image_type] + filename} File not found please recheck name')
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'{validPath[image_type] + filename} File not found please recheck name')

    logger.info(f"Format of response is FileResponse({validPath[image_type] + filename})")
    return FileResponse(validPath[image_type] + filename)
