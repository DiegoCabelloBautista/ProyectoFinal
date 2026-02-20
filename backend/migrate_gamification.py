"""
Script de migración para añadir campos de gamificación a la tabla users
"""
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

# Configuración de la base de datos
db_config = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', '8326'),
    'database': os.getenv('DB_NAME', 'gymtrack_db')
}

# Conectar a la base de datos
conn = mysql.connector.connect(**db_config)
cursor = conn.cursor()

print("🔄 Iniciando migración de base de datos...")

# Añadir columnas de gamificación a users
migrations = [
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS xp INT DEFAULT 0",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS level INT DEFAULT 1",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS coins INT DEFAULT 0",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_icon VARCHAR(50) DEFAULT 'person'",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS username_color VARCHAR(20) DEFAULT '#00C9FF'",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS title VARCHAR(50) DEFAULT NULL",
]

for migration in migrations:
    try:
        cursor.execute(migration)
        print(f"✅ Ejecutada: {migration[:50]}...")
    except mysql.connector.Error as err:
        if "Duplicate column name" in str(err):
            print(f"⚠️  Columna ya existe, saltando...")
        else:
            print(f"❌ Error: {err}")

# Crear tabla de achievements
cursor.execute("""
CREATE TABLE IF NOT EXISTS achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    icon VARCHAR(50) DEFAULT 'emoji_events',
    category VARCHAR(50),
    requirement_value INT,
    xp_reward INT DEFAULT 50,
    coins_reward INT DEFAULT 5
)
""")
print("✅ Tabla 'achievements' creada")

# Crear tabla de user_achievements
cursor.execute("""
CREATE TABLE IF NOT EXISTS user_achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    achievement_id INT NOT NULL,
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
)
""")
print("✅ Tabla 'user_achievements' creada")

# Crear tabla de shop_items
cursor.execute("""
CREATE TABLE IF NOT EXISTS shop_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    item_type VARCHAR(50),
    value VARCHAR(100),
    price INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    required_level INT DEFAULT 1
)
""")
print("✅ Tabla 'shop_items' creada")

# Confirmar cambios
conn.commit()
cursor.close()
conn.close()

print("🎉 ¡Migración completada con éxito!")
print("\n📝 Siguiente paso: ejecutar 'python seed_gamification.py' para poblar los datos")
