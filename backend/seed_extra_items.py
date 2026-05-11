from app import create_app, db
from app.models import ShopItem

app = create_app()

with app.app_context():
    # Añadir más avatares para llegar a 15+
    extra_avatars = [
        ShopItem(name="Avatar Pesas", description="Amante del hierro", item_type="avatar", value="fitness_center", price=0, required_level=1),
        ShopItem(name="Avatar Corazón", description="Entrenamiento cardiovascular", item_type="avatar", value="favorite", price=0, required_level=1),
        ShopItem(name="Avatar Rayo Azul", description="Energía pura", item_type="avatar", value="bolt", price=0, required_level=1),
        ShopItem(name="Avatar Medalla", description="Espíritu competitivo", item_type="avatar", value="military_tech", price=50, required_level=10),
        ShopItem(name="Avatar Trofeo", description="Solo para campeones", item_type="avatar", value="emoji_events", price=100, required_level=15),
        ShopItem(name="Avatar Cohete", description="Progreso explosivo", item_type="avatar", value="rocket", price=150, required_level=20),
        ShopItem(name="Avatar Diamante", description="Brillo eterno", item_type="avatar", value="diamond", price=200, required_level=25),
        ShopItem(name="Avatar Corona Pro", description="El rey del gym", item_type="avatar", value="workspace_premium", price=300, required_level=30),
        ShopItem(name="Avatar Fuego Azul", description="Calor extremo", item_type="avatar", value="local_fire_department", price=400, required_level=40),
    ]
    
    # Añadir más colores para llegar a 10+
    extra_colors = [
        ShopItem(name="Azul Cielo", description="Color básico", item_type="color", value="#00C9FF", price=0, required_level=1),
        ShopItem(name="Naranja Fuego", description="Color cálido", item_type="color", value="#F2994A", price=0, required_level=1),
        ShopItem(name="Gris Acero", description="Color sólido", item_type="color", value="#7E8C8D", price=0, required_level=1),
        ShopItem(name="Esmeralda", description="Color de la suerte", item_type="color", value="#27AE60", price=30, required_level=5),
        ShopItem(name="Plata", description="Brillo metálico", item_type="color", value="#BDC3C7", price=45, required_level=8),
        ShopItem(name="Violeta Oscuro", description="Elegancia pura", item_type="color", value="#8E44AD", price=60, required_level=12),
        ShopItem(name="Carmesí", description="Pasión por el entreno", item_type="color", value="#C0392B", price=80, required_level=18),
        ShopItem(name="Dorado Imperial", description="Lujo total", item_type="color", value="#D4AF37", price=200, required_level=25),
        ShopItem(name="Negro Mate", description="Oscuridad absoluta", item_type="color", value="#2C3E50", price=250, required_level=35),
        ShopItem(name="Rosa Neón", description="Estilo retro", item_type="color", value="#FF007F", price=300, required_level=45),
    ]
    
    for item in extra_avatars + extra_colors:
        # Evitar duplicados por nombre
        if not ShopItem.query.filter_by(name=item.name).first():
            db.session.add(item)
    
    db.session.commit()
    print("✅ Items adicionales añadidos correctamente.")
