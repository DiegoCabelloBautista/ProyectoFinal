
import mysql.connector

# Configuración de la base de datos
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '8326',
    'database': 'gymtrack_pro'
}

# Tienda Extendida (Avatares, Colores, Títulos)
new_items = [
    # Avatares nuevos
    ("Avatar Ninja", "Silencioso pero letal", "avatar", "sports_martial_arts", 150, 10),
    ("Avatar Dragón", "El fuego interior", "avatar", "cruelty_free", 300, 30),
    ("Avatar Calavera", "Entrena hasta los huesos", "avatar", "sentiment_very_dissatisfied", 200, 20),
    ("Avatar Rey", "La corona te pertenece", "avatar", "social_leaderboard", 500, 40),
    ("Avatar Campeón Mundial", "Ganador indiscutible", "avatar", "workspace_premium", 1000, 50),
    ("Avatar Gorila", "Fuerza bruta", "avatar", "pets", 250, 25),

    # Colores nuevos
    ("Color Sangre", "Rojo carmesí profundo", "color", "#8B0000", 60, 5),
    ("Color Cyan", "Un azul eléctrico muy vivo", "color", "#00FFFF", 70, 7),
    ("Color Épico", "Naranja brillante con estilo retro", "color", "#FF4500", 100, 12),
    ("Color Esmeralda", "Verde como una joya preciosa", "color", "#50C878", 120, 15),
    ("Color Platino", "Brillo gris metálico elegante", "color", "#E5E4E2", 300, 30),
    ("Color Ónice Oscuro", "Para los amantes del material design", "color", "#353839", 50, 5),

    # Títulos nuevos
    ("Título: Señor Máquina", "No tienes corazón, tienes un motor V8", "title", "Mr. Machine", 200, 15),
    ("Título: Maestro Jedi", "La fuerza está contigo", "title", "Jedi Master", 350, 25),
    ("Título: El Inmortal", "No puedes ser destruido", "title", "The Immortal", 600, 35),
    ("Título: Mutante", "Tus músculos crecen diferente", "title", "Mutant", 400, 28),
    ("Título: Dios Griego", "Forjado en el Olimpo", "title", "Greek God", 800, 45),
    ("Título: Novato Enojado", "Para los que entrenan con furia", "title", "Angry Rookie", 50, 2),

    # Más consumibles (Potenciadores y Escudos)
    ("Escudo de Racha Doble", "Te salvan 2 días seguidos sin entrenar.", "consumable", "streak_shield", 90, 5), # Precio en rebaja comparado a 2 separados
    ("Ultra Carga (3x XP)", "Triplica la experiencia por las próximas 3 sesiones.", "consumable", "multiplier_3.0_sessions_3", 250, 15),
    ("Pack Semanal de XP (1.5x XP)", "50% más de XP por las próximas 7 sesiones.", "consumable", "multiplier_1.5_sessions_7", 60, 5),
]

# Logros (Achievements)
new_achievements = [
    # Racha de entrenamientos
    ("Racha de Bronce", "Entrena 3 días seguidos", "local_fire_department", "streak", 3, 50, 20),
    ("Racha de Plata", "Entrena 7 días seguidos", "local_fire_department", "streak", 7, 100, 50),
    ("Racha de Oro", "Entrena 14 días seguidos", "local_fire_department", "streak", 14, 250, 100),
    ("El Invencible", "Entrena 30 días seguidos", "local_fire_department", "streak", 30, 1000, 500),

    # Volumen Extremo
    ("Hulk Smash", "Levanta 500,000 kg totales a lo largo del tiempo", "fitness_center", "volume", 500000, 1500, 300),
    ("Atlas", "Sostén el mundo: 1,000,000 kg totales levantados", "public", "volume", 1000000, 3000, 1000),

    # Nivel Alto
    ("Centurión", "Alcanza el nivel 100", "military_tech", "level", 100, 5000, 2000),

    # Social (si los implements en el futuro, pero vamos preparándolos)
    ("Influencer del Gym", "Recibe 10 Likes en tus rutinas públicas", "thumb_up", "social", 10, 100, 50),
    ("Entrenador Estrella", "Recibe 50 Likes en tus rutinas públicas", "thumb_up", "social", 50, 500, 200),
]

try:
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    print("--- INICIANDO INSERCIÓN DE NUEVOS OBJETOS ---")

    # Insertar en Tienda (ShopItems)
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

    # Insertar en Logros (Achievements)
    for name, desc, icon, category, req_val, xp_rew, coins_rew in new_achievements:
        cursor.execute("SELECT id FROM achievements WHERE name = %s", (name,))
        if cursor.fetchone() is None:
            cursor.execute("""
                INSERT INTO achievements (name, description, icon, category, requirement_value, xp_reward, coins_reward)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (name, desc, icon, category, req_val, xp_rew, coins_rew))
            print(f"✅ Logro '{name}' añadido a los logros.")
        else:
            print(f"⚠️  Logro '{name}' ya existía.")

    conn.commit()
    cursor.close()
    conn.close()
    print("🎉 ¡Nuevos elementos añadidos exitosamente!")
    
except Exception as e:
    print(f"❌ Error al poblar: {e}")
