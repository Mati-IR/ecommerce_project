from fastapi import FastAPI, HTTPException
from sqlalchemy import create_engine, Column, Integer, String, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from databases import Database

DATABASE_URL = "mysql+mysqlconnector://user:password@db:3306/SayHelloToMyLittleFriend"

database = Database(DATABASE_URL)
metadata = MetaData()
Base = declarative_base(metadata=metadata)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    email = Column(String(255), index=True, unique=True)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

app = FastAPI()

@app.on_event("startup")
async def startup():
    await database.connect()
    Base.metadata.create_all(engine)

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

@app.post("/users/")
async def create_user(user: User):
    query = User.__table__.insert().values(id=user.id, name=user.name, email=user.email)
    await database.execute(query)
    return user

@app.get("/users/{user_id}/{password_hash}")
async def get_user(user_id: int, password_hash: str):
    if not database.is_connected:
        raise HTTPException(status_code=500, detail="Database connection error.")

    query = User.__table__.select().where(User.id == user_id)
    user = await database.fetch_one(query)

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    elif user.password_hash != password_hash:
        raise HTTPException(status_code=401, detail="Incorrect password.")

    return user
