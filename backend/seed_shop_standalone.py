
import mysql.connector

# Configuración de la base de datos
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '8326',
    'database': 'gymtrack_pro'
}

items = [
    # Escudos de Racha
    ("Escudo de Racha", "Protege tu racha si olvidas entrenar un día.", "consumable", "streak_shield", 50, 1),
    # Potenciadores de XP
    ("Pack Energía (1.5x XP)", "Gana un 50% más de XP durante las próximas 3 sesiones.", "consumable", "multiplier_1.5_sessions_3", 30, 3),
    ("Super Carga (2x XP)", "Dobla tu XP durante las próximas 5 sesiones.", "consumable", "multiplier_2.0_sessions_5", 100, 10),
    # Extra Premium
    ("Avatar Fénix", "El poder del renacimiento", "avatar", "fireplace", 250, 25),
    ("Color Galáctico", "Un color púrpura espacial", "color", "#6A11CB", 80, 15),
    ("Título: Máquina Humana", "Sin descanso", "title", "Human Machine", 150, 22),
]

try:
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    for name, desc, item_type, value, price, level in items:
        # Evitar duplicados
        cursor.execute("SELECT id FROM shop_items WHERE name = %s", (name,))
        if cursor.fetchone() is None:
            cursor.execute("""
                INSERT INTO shop_items (name, description, item_type, value, price, required_level)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (name, desc, item_type, value, price, level))
            print(f"✅ Item '{name}' añadido.")
        else:
            print(f"⚠️  Item '{name}' ya existe.")

    conn.commit()
    cursor.close()
    conn.close()
    print("🎉 ¡Tienda poblada exitosamente!")
except Exception as e:
    print(f"❌ Error al poblar: {e}")
