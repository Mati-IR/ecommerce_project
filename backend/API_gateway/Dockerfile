FROM tiangolo/uvicorn-gunicorn-fastapi:python3.9

WORKDIR /app

COPY ./requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY ./ /app/

CMD ["uvicorn", "API_gateway:app", "--host", "0.0.0.0", "--port", "8000"]
