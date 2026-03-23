
import mysql.connector

# Configuración de la base de datos
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '8326',
    'database': 'gymtrack_pro'
}

new_items = [
    # Badges extra
    ("Badge Fundador", "Estuviste desde el principio", "badge", "stars", 1000, 10),
    ("Badge VIP", "Usuario muy importante", "badge", "diamond", 2000, 20),
    ("Badge Maestro", "Dominio absoluto", "badge", "school", 1500, 30),

    # Avatares divertidos
    ("Avatar Alien", "De otro planeta", "avatar", "emoji_nature", 400, 15),
    ("Avatar Robot", "Precisión mecánica", "avatar", "smart_toy", 350, 12),
    ("Avatar Fantasma", "Entrenamiento invisible", "avatar", "sentiment_very_dissatisfied", 250, 8),

    # Títulos graciosos
    ("Título: El Pre-Entreno Vidente", "Ves sonidos", "title", "Pre-workout Seer", 150, 5),
    ("Título: Saltador de Pierna", "Hoy toca pecho", "title", "Leg Day Skipper", 50, 2),
    ("Título: Rey del Cardio", "Corres más que Forrest", "title", "Cardio King", 200, 10),

    # Colores premium
    ("Color Oro Brillante", "Como un lingote", "color", "#FFD700", 500, 20),
    ("Color Neón Cyberpunk", "El futuro es ahora", "color", "#FF00FF", 450, 18),
]

try:
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    for name, desc, item_type, value, price, level in new_items:
        cursor.execute("SELECT id FROM shop_items WHERE name = %s", (name,))
        if cursor.fetchone() is None:
            cursor.execute("""
                INSERT INTO shop_items (name, description, item_type, value, price, required_level)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (name, desc, item_type, value, price, level))
            print(f"✅ Item '{name}' añadido a la tienda.")
        else:
            print(f"⚠️  Item '{name}' ya existía en la tienda.")

    conn.commit()
    cursor.close()
    conn.close()
    print("🎉 ¡Aún más elementos añadidos exitosamente!")
    
except Exception as e:
    print(f"❌ Error al poblar: {e}")
