import os
import ffmpeg
from PIL import Image
from uuid import uuid4
from pathlib import Path
from fastapi import HTTPException, status
from ..helpers.alena import local_savings
from ..helpers.uniqueFileName import generate_unique_name

#setup logger
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def resize_image(temp_stored_file: Path, extension: str, thumbnail: bool, desiredExtension: str):
    if not thumbnail and not os.environ.get('SAVE_ORIGINAL') == 'True':
        logger.error(f"resize_image: Save original is dissabled, contact administrator")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail='Save original is dissabled, contact admin')

    local_savings(images=True)

    if os.environ.get('IMAGE_OPTIMIZATION_USING') == 'ffmpeg':
        return resize_image_pillow_FFMPEG(temp_stored_file, extension, thumbnail, desiredExtension)
    return resize_image_pillow_SIMD(temp_stored_file, extension, thumbnail, desiredExtension)


def resize_image_pillow_SIMD(temp_stored_file: Path, extension: str, thumbnail: bool, desiredExtension: str):

    try:
        origin, thumb = generate_unique_name(extension, desiredExtension)
        img = Image.open(temp_stored_file)
        if os.environ.get('SAVE_ORIGINAL') == 'True':
            img.save(Path(os.environ.get('IMAGE_ORIGINAL_LOCAL_PATH') + origin).absolute())
        else:
            origin = None
        if thumbnail:
            resize_width = int(os.environ.get('THUMBNAIL_MAX_WIDHT'))
            wpercent = (resize_width/float(img.size[0]))
            hsize = int((float(img.size[1])*float(wpercent)))
            img.thumbnail((resize_width,hsize), Image.BICUBIC)
            img.save(Path(os.environ.get('IMAGE_THUMBNAIL_LOCAL_PATH') + thumb).absolute())
        else:
            thumb = None
        return {
            'original': origin,
            'thumbnail': thumb
        }
    except:
        raise HTTPException(status_code=503, detail="Image manipulation failed using pillow-SIMD")

def resize_image_pillow_FFMPEG(temp_stored_file: Path, extension: str, thumbnail: bool, desiredExtension: str):
    try:
        origin, thumb = generate_unique_name(extension, desiredExtension)
        # Save original (reduces size magically)
        if os.environ.get('SAVE_ORIGINAL') == 'True':
            (
                ffmpeg
                .input(temp_stored_file)
                .output(os.environ.get('IMAGE_ORIGINAL_LOCAL_PATH') + origin)
                .run(quiet=True)
            )
        else:
            origin = None
        if thumbnail:
            # Resizes and Save
            (
                ffmpeg
                .input(temp_stored_file)
                .filter("scale", os.environ.get('THUMBNAIL_MAX_WIDHT'), "-1")
                .output(os.environ.get('IMAGE_THUMBNAIL_LOCAL_PATH') + thumb)
                .run(quiet=True)
            )
        else:
            thumb = None
        return {
            'original': origin,
            'thumbnail': thumb
        }
    except:
        raise HTTPException(status_code=503, detail="Image manipulation failed using FFMPEG")