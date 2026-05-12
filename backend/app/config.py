import os
from datetime import timedelta
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'gymtrack-secret-key'
    db_url = os.environ.get('DATABASE_URL')
    if db_url:
        if db_url.startswith('mysql://'):
            db_url = db_url.replace('mysql://', 'mysql+pymysql://', 1)
    if db_url and 'charset' not in db_url:
        separator = '&' if '?' in db_url else '?'
        db_url = f"{db_url}{separator}charset=utf8mb4"
    
    SQLALCHEMY_DATABASE_URI = db_url or 'mysql+pymysql://root:8326@localhost/gymtrack_pro?charset=utf8mb4'
    
    # Configuración de motor optimizada para Aiven/nube
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 280,
        "pool_size": 10,
        "max_overflow": 20,
    }
    
    # Argumentos de conexión
    connect_args = {}
    
    # Si hay DATABASE_URL, asumimos producción (Render/Aiven)
    if os.environ.get('DATABASE_URL'):
        # Si estamos en Aiven, forzamos SSL pero saltamos la verificación de certificado para mayor compatibilidad
        if 'aivencloud.com' in os.environ.get('DATABASE_URL', ''):
            import ssl
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            connect_args["ssl"] = ctx
        else:
            # Fallback para otros proveedores con CA estándar
            connect_args["ssl"] = {"ca": "/etc/ssl/certs/ca-certificates.crt"}
        
        connect_args["connect_timeout"] = 15
    
    SQLALCHEMY_ENGINE_OPTIONS["connect_args"] = connect_args
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
