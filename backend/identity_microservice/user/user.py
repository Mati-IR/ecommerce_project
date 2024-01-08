from fastapi import HTTPException
from database.query import query_get, query_put, query_update
from .auth import Auth
from .models import UserUpdateRequestModel, SignUpRequestModel

auth_handler = Auth()

import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def register_user(user_model: SignUpRequestModel):
    user = get_user_by_email(user_model.email)
    if len(user) != 0:
        raise HTTPException(
            status_code=409, detail='Email user already exist.')
    hashed_password = auth_handler.encode_password(user_model.password)
    query_put("""
                INSERT INTO users (
                    name,
                    email
                ) VALUES (%s,%s);
                """,
              (
                  user_model.name,
                  user_model.email
              )
              )
    user = get_user_by_email(user_model.email)
    if len(user) == 0:
        raise HTTPException(status_code=500, detail='Error in register_user->get_user_by_email, user not found.')
    else:
        query_put("""
                    INSERT INTO users_password (
                        user_id,
                        password_hash
                    ) VALUES (%s,%s);
                    """,
                (
                    user[0]['id'],
                    hashed_password
                )
                )
    return user[0]


def signin_user(email, password):
    user = get_user_by_email(email)
    password_hash = ''
    if len(user) == 0:
        print('Invalid email')
        raise HTTPException(status_code=401, detail='Invalid email')
    else:
        password_hash = get_user_password_hash(email)

    if (not auth_handler.verify_password(password, password_hash)):
        print('Invalid password')
        raise HTTPException(status_code=401, detail='Invalid password')
    return user[0]


def update_user(user_model: UserUpdateRequestModel):
    # hashed_password = auth_handler.encode_password(user_model.password)
    logger.info(f"update_user: {user_model}")
    query_put("""
            UPDATE users 
                SET
                    name = %s,
                    email = %s,
                    phone = %s,
                    city = %s,
                    postal_code = %s,
                    street = %s,
                    street_number = %s,
                    website = %s
                WHERE id = %s;
            """,
              (
                    user_model.name,
                    user_model.email,
                    user_model.phone,
                    user_model.city,
                    user_model.postal_code,
                    user_model.street,
                    user_model.street_number,
                    user_model.website,
                    user_model.id
                )
                )
    user = get_user_by_email(user_model.email)
    return user[0]


def get_all_users():
    user = query_get("""
        SELECT  
            users.id,
            users.name,
            users.email
        FROM users
        """, ())
    return user


def get_user_by_email(email: str):
    user = query_get("""
        SELECT 
            users.id,
            users.name,
            users.email
        FROM users 
        WHERE email = %s
        """, (email))
    return user


def get_user_by_id(id: int):
    user = query_get("""
        SELECT 
            users.id,
            users.name,
            users.email,
            users.phone,
            users.city,
            users.postal_code,
            users.street,
            users.street_number,
            users.website
        FROM users 
        WHERE id = %s
        """, (id))
    return user

def get_user_password_hash(email: str):
    user = query_get("""
        SELECT 
            users_password.password_hash
        FROM users_password 
        INNER JOIN users ON users_password.user_id = users.id
        WHERE users.email = %s
        """, (email))
    return user[0]['password_hash']
