import pymysql
import os

# DATOS DE TU AIVEN (Cámbialos si no son estos)
host = 'mysql-4098805-gymtrackpro.f.aivencloud.com'
port = 25954
user = 'avnadmin'
password = os.getenv('AIVEN_PASSWORD', 'your_password_here')
db = 'defaultdb'

print(f"Intentando conectar a {host}:{port}...")

try:
    connection = pymysql.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        database=db,
        ssl={'fake_flag': True}
    )
    print("✅ ¡CONEXIÓN EXITOSA!")
    with connection.cursor() as cursor:
        cursor.execute("SHOW TABLES;")
        tables = cursor.fetchall()
        print(f"Tablas encontradas: {len(tables)}")
        for t in tables:
            print(f" - {t[0]}")
    connection.close()
except Exception as e:
    print(f"❌ ERROR DE CONEXIÓN: {str(e)}")
