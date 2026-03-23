
from app import create_app, db
from app.models import ShopItem

app = create_app()

with app.app_context():
    # Nuevos Items: Consumibles
    consumables = [
        # Escudos de Racha
        ShopItem(
            name="Escudo de Racha", 
            description="Protege tu racha si olvidas entrenar un día.", 
            item_type="consumable", 
            value="streak_shield", 
            price=50, 
            required_level=1
        ),
        
        # Potenciadores de XP
        ShopItem(
            name="Pack Energía (1.5x XP)", 
            description="Gana un 50% más de XP durante las próximas 3 sesiones.", 
            item_type="consumable", 
            value="multiplier_1.5_sessions_3", 
            price=30, 
            required_level=3
        ),
        ShopItem(
            name="Super Carga (2x XP)", 
            description="Dobla tu XP durante las próximas 5 sesiones.", 
            item_type="consumable", 
            value="multiplier_2.0_sessions_5", 
            price=100, 
            required_level=10
        ),
    ]

    # Nuevos Items: Personalización Visual (Marcos / Temas si hubiera campos, pero usemos los tipos actuales)
    # Podemos añadir más colores y avatares premium
    extra_items = [
        ShopItem(name="Avatar Fénix", description="El poder del renacimiento", item_type="avatar", value="fireplace", price=250, required_level=25),
        ShopItem(name="Color Galáctico", description="Un color púrpura espacial", item_type="color", value="#6A11CB", price=80, required_level=15),
        ShopItem(name="Título: Máquina Humana", description="Sin descanso", item_type="title", value="Human Machine", price=150, required_level=22),
    ]

    for item in consumables + extra_items:
        # Evitar duplicados si volvemos a ejecutar
        exists = ShopItem.query.filter_by(name=item.name).first()
        if not exists:
            db.session.add(item)
    
    db.session.commit()
    print(f"✅ Añadidos {len(consumables + extra_items)} nuevos items a la tienda!")
