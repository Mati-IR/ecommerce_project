FROM tiangolo/uvicorn-gunicorn-fastapi:python3.10

WORKDIR /app

COPY ./requirements.txt /app/
RUN pip install --no-cache-dir --trusted-host pypi.python.org -r requirements.txt

COPY ./ /app/

CMD ["uvicorn", "MVC_basket:app", "--host", "0.0.0.0", "--port", "8003"]