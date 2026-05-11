import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'gymtrack-secret-key'
    db_url = os.environ.get('DATABASE_URL')
    if db_url and db_url.startswith('mysql://'):
        db_url = db_url.replace('mysql://', 'mysql+pymysql://', 1)
    
    SQLALCHEMY_DATABASE_URI = db_url or 'mysql+pymysql://root:8326@localhost/gymtrack_pro'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
