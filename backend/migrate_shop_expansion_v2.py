
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

# Configuración de la base de datos
# Como estamos fuera de docker, usamos localhost (mapeado en docker-compose)
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '8326',
    'database': 'gymtrack_pro'
}

try:
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    print("🔄 Iniciando expansión de la tienda y colecciones...")

    # 1. Añadir columnas a la tabla users
    alter_users = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_shields INT DEFAULT 0",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS xp_booster_multiplier FLOAT DEFAULT 1.0",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS xp_booster_sessions INT DEFAULT 0"
    ]

    for sql in alter_users:
        try:
            cursor.execute(sql)
            print(f"✅ Ejecutado: {sql}")
        except Exception as e:
            print(f"⚠️  Aviso en users: {e}")

    # 2. Crear tabla user_items
    create_user_items = """
    CREATE TABLE IF NOT EXISTS user_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        item_id INT NOT NULL,
        purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES shop_items(id) ON DELETE CASCADE
    )
    """
    cursor.execute(create_user_items)
    print("✅ Tabla 'user_items' creada/verificada")

    conn.commit()
    cursor.close()
    conn.close()
    print("🎉 Migración de expansión completada!")

except Exception as e:
    print(f"❌ Error fatal en la migración: {e}")
