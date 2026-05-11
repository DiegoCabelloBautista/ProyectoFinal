from app import create_app, db
from app.models import Achievement, ShopItem

app = create_app()

with app.app_context():
    # Limpiar achievements previos para evitar duplicados en el set de 15
    Achievement.query.delete()
    
    new_achievements = [
        # CATEGORÍA: SESIONES (S)
        Achievement(
            name="Primer Paso", 
            description="Completa tu primer entrenamiento", 
            icon="fitness_center", 
            category="sessions", 
            requirement_value=1, 
            xp_reward=50, 
            coins_reward=10
        ),
        Achievement(
            name="Atleta Regular", 
            description="Completa 20 entrenamientos totales", 
            icon="event_available", 
            category="sessions", 
            requirement_value=20, 
            xp_reward=200, 
            coins_reward=50
        ),
        Achievement(
            name="Leyenda del Gym", 
            description="Completa 100 entrenamientos totales", 
            icon="military_tech", 
            category="sessions", 
            requirement_value=100, 
            xp_reward=1000, 
            coins_reward=250
        ),

        # CATEGORÍA: RACHAS (R)
        Achievement(
            name="Semana de Acero", 
            description="Mantén una racha de 7 días entrenando", 
            icon="calendar_today", 
            category="streak", 
            requirement_value=7, 
            xp_reward=100, 
            coins_reward=25
        ),
        Achievement(
            name="Mes Inquebrantable", 
            description="Mantén una racha de 30 días entrenando", 
            icon="workspace_premium", 
            category="streak", 
            requirement_value=30, 
            xp_reward=500, 
            coins_reward=150
        ),
        Achievement(
            name="Imparable", 
            description="Alcanza una racha legendaria de 100 días", 
            icon="local_fire_department", 
            category="streak", 
            requirement_value=100, 
            xp_reward=2000, 
            coins_reward=1000
        ),

        # CATEGORÍA: SOCIAL / COMUNIDAD (C)
        Achievement(
            name="Primer Aplauso", 
            description="Recibe tu primer LIKE en una rutina pública", 
            icon="thumb_up", 
            category="social_likes", 
            requirement_value=1, 
            xp_reward=30, 
            coins_reward=15
        ),
        Achievement(
            name="Influencer Fitness", 
            description="Acumula 50 LIKES entre todas tus rutinas", 
            icon="stars", 
            category="social_likes", 
            requirement_value=50, 
            xp_reward=300, 
            coins_reward=150
        ),
        Achievement(
            name="Crítico Experto", 
            description="Escribe 5 reseñas en rutinas de otros usuarios", 
            icon="rate_review", 
            category="social_reviews", 
            requirement_value=5, 
            xp_reward=100, 
            coins_reward=40
        ),
        Achievement(
            name="Explorador", 
            description="Guarda 5 rutinas de la comunidad en tu biblioteca", 
            icon="auto_stories", 
            category="social_saves", 
            requirement_value=5, 
            xp_reward=80, 
            coins_reward=30
        ),
        Achievement(
            name="Maestro de Rutinas", 
            description="Crea 10 rutinas propias", 
            icon="design_services", 
            category="social_creates", 
            requirement_value=10, 
            xp_reward=150, 
            coins_reward=60
        ),
        Achievement(
            name="Conectado", 
            description="Sigue a 10 atletas de la comunidad", 
            icon="person_add", 
            category="social_follows", 
            requirement_value=10, 
            xp_reward=50, 
            coins_reward=20
        ),

        # CATEGORÍA: NIVEL (N)
        Achievement(
            name="Ascenso II", 
            description="Alcanza el nivel 10", 
            icon="trending_up", 
            category="level", 
            requirement_value=10, 
            xp_reward=200, 
            coins_reward=100
        ),
        Achievement(
            name="Veterano", 
            description="Alcanza el nivel 25", 
            icon="shield", 
            category="level", 
            requirement_value=25, 
            xp_reward=500, 
            coins_reward=250
        ),
        Achievement(
            name="Maestro del Olimpo", 
            description="Alcanza el nivel 50", 
            icon="diamond", 
            category="level", 
            requirement_value=50, 
            xp_reward=1500, 
            coins_reward=1000
        ),
    ]

    for ach in new_achievements:
        db.session.add(ach)
    
    db.session.commit()
    print(f"✅ Se han creado {len(new_achievements)} logros exitosamente.")
