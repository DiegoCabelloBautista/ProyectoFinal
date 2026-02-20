"""
Script para poblar la base de datos con items de tienda y achievements
Ejecutar: python seed_gamification.py
"""
from app import create_app, db
from app.models import ShopItem, Achievement

app = create_app()

with app.app_context():
    # Limpiar datos existentes
    ShopItem.query.delete()
    Achievement.query.delete()
    
    # Items de Avatares
    avatars = [
        ShopItem(name="Avatar Fuego", description="Icono de llama ardiente", item_type="avatar", value="local_fire_department", price=20, required_level=3),
        ShopItem(name="Avatar Estrella", description="Brilla como una estrella", item_type="avatar", value="star", price=30, required_level=5),
        ShopItem(name="Avatar Rayo", description="Velocidad y poder", item_type="avatar", value="flash_on", price=40, required_level=8),
        ShopItem(name="Avatar Diamante", description="Exclusivo y premium", item_type="avatar", value="diamond", price=100, required_level=15),
        ShopItem(name="Avatar Corona", description="Eres la realeza del gym", item_type="avatar", value="workspace_premium", price=150, required_level=20),
        ShopItem(name="Avatar Legendario", description="Solo para élite", item_type="avatar", value="military_tech", price=300, required_level=30),
    ]
    
    # Colores de Nombre
    colors = [
        ShopItem(name="Verde Neón", description="Brilla en verde", item_type="color", value="#92FE9D", price=15, required_level=2),
        ShopItem(name="Rosa Vibrante", description="Destaca en rosa", item_type="color", value="#FF6B9D", price=15, required_level=2),
        ShopItem(name="Dorado", description="Color premium", item_type="color", value="#FFD700", price=50, required_level=10),
        ShopItem(name="Púrpura Místico", description="Misterioso y elegante", item_type="color", value="#9D4EDD", price=60, required_level=12),
        ShopItem(name="Rojo Fuego", description="Intensidad pura", item_type="color", value="#FF4444", price=40, required_level=8),
        ShopItem(name="Arcoiris", description="Todos los colores", item_type="color", value="linear-gradient", price=200, required_level=25),
    ]
    
    # Títulos
    titles = [
        ShopItem(name="Título: Novato Dedicado", description="Para los que empiezan con fuerza", item_type="title", value="Novato Dedicado", price=10, required_level=1),
        ShopItem(name="Título: Guerrero de Hierro", description="Forjado en el gimnasio", item_type="title", value="Iron Warrior", price=80, required_level=15),
        ShopItem(name="Título: Bestia del Gym", description="Dominas el gimnasio", item_type="title", value="Gym Beast", price=120, required_level=20),
        ShopItem(name="Título: Leyenda Viviente", description="Tu nombre es leyenda", item_type="title", value="Gym Legend", price=250, required_level=35),
        ShopItem(name="Título: Dios del Olimpo", description="Has alcanzado lo imposible", item_type="title", value="Olympus God", price=500, required_level=50),
    ]
    
    # Badge Verificado
    badges = [
        ShopItem(name="Badge Verificado", description="Marca de autenticidad", item_type="badge", value="verified", price=75, required_level=10),
    ]
    
    # Logros/Achievements
    achievements = [
        # Sesiones
        Achievement(name="Primera Sesión", description="Completa tu primer entrenamiento", icon="emoji_events", category="sessions", requirement_value=1, xp_reward=10, coins_reward=5),
        Achievement(name="5 Sesiones", description="Completa 5 entrenamientos", icon="emoji_events", category="sessions", requirement_value=5, xp_reward=25, coins_reward=10),
        Achievement(name="10 Sesiones", description="Completa 10 entrenamientos", icon="emoji_events", category="sessions", requirement_value=10, xp_reward=50, coins_reward=20),
        Achievement(name="25 Sesiones", description="Completa 25 entrenamientos", icon="emoji_events", category="sessions", requirement_value=25, xp_reward=100, coins_reward=40),
        Achievement(name="50 Sesiones", description="Completa 50 entrenamientos", icon="emoji_events", category="sessions", requirement_value=50, xp_reward=200, coins_reward=75),
        Achievement(name="100 Sesiones", description="Completa 100 entrenamientos", icon="emoji_events", category="sessions", requirement_value=100, xp_reward=500, coins_reward=150),
        
        # Volumen
        Achievement(name="1 Tonelada", description="Levanta 1,000 kg totales", icon="fitness_center", category="volume", requirement_value=1000, xp_reward=30, coins_reward=15),
        Achievement(name="10 Toneladas", description="Levanta 10,000 kg totales", icon="fitness_center", category="volume", requirement_value=10000, xp_reward=100, coins_reward=40),
        Achievement(name="50 Toneladas", description="Levanta 50,000 kg totales", icon="fitness_center", category="volume", requirement_value=50000, xp_reward=300, coins_reward=100),
        Achievement(name="100 Toneladas", description="Levanta 100,000 kg totales", icon="fitness_center", category="volume", requirement_value=100000, xp_reward=600, coins_reward=200),
        
        # Niveles
        Achievement(name="Nivel 5", description="Alcanza el nivel 5", icon="trending_up", category="level", requirement_value=5, xp_reward=50, coins_reward=25),
        Achievement(name="Nivel 10", description="Alcanza el nivel 10", icon="trending_up", category="level", requirement_value=10, xp_reward=100, coins_reward=50),
        Achievement(name="Nivel 20", description="Alcanza el nivel 20", icon="trending_up", category="level", requirement_value=20, xp_reward=250, coins_reward=100),
        Achievement(name="Nivel 30", description="Alcanza el nivel 30", icon="trending_up", category="level", requirement_value=30, xp_reward=500, coins_reward=200),
        Achievement(name="Nivel 50", description="Alcanza el nivel 50", icon="trending_up", category="level", requirement_value=50, xp_reward=1000, coins_reward=500),
    ]
    
    # Añadir todo a la base de datos
    for item in avatars + colors + titles + badges:
        db.session.add(item)
    
    for achievement in achievements:
        db.session.add(achievement)
    
    db.session.commit()
    
    print(f"✅ Creados {len(avatars + colors + titles + badges)} items de tienda")
    print(f"✅ Creados {len(achievements)} achievements")
    print("🎉 Base de datos de gamificación poblada correctamente!")
