from ..models import db, User, Exercise, Achievement, ShopItem
from werkzeug.security import generate_password_hash
from datetime import datetime

def seed_everything():
    """Función para sembrar la base de datos con contenido esencial."""
    print("🚀 Iniciando sembrado de base de datos...")
    
    # 1. Usuarios Maestros
    if not User.query.filter_by(username='admin_gtp').first():
        admin = User(
            username='admin_gtp',
            email='admin@gymtrackpro.com',
            role='admin',
            level=50,
            coins=1000
        )
        admin.set_password('admin123')
        db.session.add(admin)
        print("✅ Usuario admin_gtp creado.")

    if not User.query.filter_by(username='trainer_gtp').first():
        trainer = User(
            username='trainer_gtp',
            email='trainer@gymtrackpro.com',
            role='trainer',
            level=30,
            coins=500
        )
        trainer.set_password('trainer123')
        db.session.add(trainer)
        print("✅ Usuario trainer_gtp creado.")

    # 2. Ejercicios (100)
    if Exercise.query.count() < 10:
        print("Sembrando 100 ejercicios...")
        exercises_data = [
            # PECHO
            ('Press de Banca con Barra', 'Pecho'), ('Press Inclinado con Mancuernas', 'Pecho'), ('Press Declinado', 'Pecho'), 
            ('Aperturas en Polea', 'Pecho'), ('Flexiones (Push-ups)', 'Pecho'), ('Dips de Pecho (Fondos)', 'Pecho'),
            ('Press de Pecho en Máquina', 'Pecho'), ('Aperturas con Mancuernas', 'Pecho'), ('Cruce de Poleas Altas', 'Pecho'),
            ('Peck Deck (Aperturas Máquina)', 'Pecho'),
            # ESPALDA
            ('Dominadas', 'Espalda'), ('Remo con Barra', 'Espalda'), ('Jalón al Pecho', 'Espalda'), 
            ('Remo en Polea Baja', 'Espalda'), ('Pull-over en Polea', 'Espalda'), ('Hiperextensiones', 'Espalda'),
            ('Remo con Mancuerna', 'Espalda'), ('Jalón tras Nuca', 'Espalda'), ('Peso Muerto Convencional', 'Espalda'),
            ('Remo en Barra T', 'Espalda'),
            # HOMBROS
            ('Press Militar con Barra', 'Hombros'), ('Elevaciones Laterales', 'Hombros'), ('Press Arnold', 'Hombros'),
            ('Face Pulls', 'Hombros'), ('Pájaros (Posterior)', 'Hombros'), ('Encogimientos de Hombros', 'Hombros'),
            ('Press Hombros Mancuernas', 'Hombros'), ('Elevaciones Frontales', 'Hombros'), ('Elevaciones Laterales Polea', 'Hombros'),
            ('Remo al Cuello', 'Hombros'),
            # PIERNAS
            ('Sentadillas con Barra', 'Piernas'), ('Prensa de Piernas', 'Piernas'), ('Extensión de Cuádriceps', 'Piernas'),
            ('Zancadas (Lunges)', 'Piernas'), ('Sentadilla Búlgara', 'Piernas'), ('Step-ups con Mancuernas', 'Piernas'),
            ('Sentadilla Hack', 'Piernas'), ('Goblet Squat', 'Piernas'), ('Extensiones a una pierna', 'Piernas'),
            ('Sissy Squat', 'Piernas'),
            # ISQUIOS
            ('Peso Muerto Rumano', 'Isquios'), ('Curl Femoral Tumbado', 'Isquios'), ('Curl Femoral Sentado', 'Isquios'),
            ('Peso Muerto Sumo', 'Isquios'), ('Buenos Días (Good Mornings)', 'Isquios'), ('Curl Femoral a una mano', 'Isquios'),
            ('Glute-Ham Raise', 'Isquios'), ('Nordic Curls', 'Isquios'), ('Peso Muerto con Mancuernas', 'Isquios'),
            ('Puente de Isquios', 'Isquios'),
            # GLÚTEOS
            ('Hip Thrust (Empuje Cadera)', 'Glúteos'), ('Patada de Glúteo en Polea', 'Glúteos'), ('Abductores en Máquina', 'Glúteos'),
            ('Clamshells (Almejas)', 'Glúteos'), ('Monster Walk', 'Glúteos'), ('Fire Hydrants', 'Glúteos'),
            ('Step-up Lateral', 'Glúteos'), ('Frog Pumps', 'Glúteos'), ('Sentadilla Sumo', 'Glúteos'),
            ('Extensiones de Cadera Banco', 'Glúteos'),
            # BÍCEPS
            ('Curl de Bíceps con Barra', 'Bíceps'), ('Martillo (Hammer Curl)', 'Bíceps'), ('Curl Predicador', 'Bíceps'),
            ('Curl Mancuernas Alterno', 'Bíceps'), ('Curl Concentrado', 'Bíceps'), ('Curl en Polea Baja', 'Bíceps'),
            ('Curl Spider (Araña)', 'Bíceps'), ('Curl Inclinado Mancuernas', 'Bíceps'), ('Zottman Curl', 'Bíceps'),
            ('Curl con Barra Z', 'Bíceps'),
            # TRÍCEPS
            ('Press Francés', 'Tríceps'), ('Extensión en Polea Alta', 'Tríceps'), ('Patada de Tríceps', 'Tríceps'),
            ('Dips en Paralelas', 'Tríceps'), ('Press de Banca Cerrado', 'Tríceps'), ('Extensión tras nuca Mancuerna', 'Tríceps'),
            ('Pushdown con Cuerda', 'Tríceps'), ('Skullcrushers con Mancuernas', 'Tríceps'), ('Extensión Polea a una mano', 'Tríceps'),
            ('Fondos entre Bancos', 'Tríceps'),
            # ABDOMINALES
            ('Plancha Abdominal', 'Abdominales'), ('Crunches (Encogimientos)', 'Abdominales'), ('Elevación de Piernas', 'Abdominales'),
            ('Rueda Abdominal', 'Abdominales'), ('Twist Ruso', 'Abdominales'), ('Woodchoppers Polea', 'Abdominales'),
            ('Deadbug', 'Abdominales'), ('Mountain Climbers', 'Abdominales'), ('Hanging Leg Raises', 'Abdominales'),
            ('V-Ups (Abdominales V)', 'Abdominales'),
            # CARDIO
            ('Burpees', 'Cardio'), ('Saltos al Cajón', 'Cardio'), ('Correr en Cinta', 'Cardio'),
            ('Remo en Máquina', 'Cardio'), ('Elíptica', 'Cardio'), ('Bicicleta Estática', 'Cardio'),
            ('Jumping Jacks', 'Cardio'), ('Salto a la Comba', 'Cardio'), ('Boxeo (Saco)', 'Cardio'),
            ('Kettlebell Swings', 'Cardio')
        ]
        for name, group in exercises_data:
            if not Exercise.query.filter_by(name=name).first():
                db.session.add(Exercise(name=name, muscle_group=group))
        print("✅ Ejercicios sembrados.")

    # 3. Tienda
    if ShopItem.query.count() == 0:
        print("Sembrando Tienda...")
        items = [
            ('Avatar: Atleta', 'Icono básico', 'avatar', 'person', 0, 1),
            ('Avatar: Karateka', 'Icono de artes marciales', 'avatar', 'sports_martial_arts', 0, 1),
            ('Avatar: Gimnasta', 'Icono de agilidad', 'avatar', 'sports_gymnastics', 0, 1),
            ('Avatar: Pesista', 'Icono de fuerza', 'avatar', 'fitness_center', 50, 5),
            ('Avatar: Zen', 'Icono de meditación', 'avatar', 'self_improvement', 100, 10),
            ('Color: Cyan', 'Estilo clásico', 'color', '#00C9FF', 0, 1),
            ('Color: Esmeralda', 'Estilo natural', 'color', '#10B981', 0, 1),
            ('Color: Dorado', 'Estilo Campeón', 'color', '#FFD700', 2000, 50),
            ('Proteína Whey', 'Multiplicador XP 1.5x (5 sesiones)', 'consumable', 'multiplier_1.5_5', 100, 1),
            ('Escudo de Racha', 'Protege tu racha si fallas un día', 'consumable', 'streak_shield', 200, 1)
        ]
        for name, desc, itype, val, price, lvl in items:
            db.session.add(ShopItem(name=name, description=desc, item_type=itype, value=val, price=price, required_level=lvl))
        print("✅ Tienda sembrada.")

    # 4. Logros
    if Achievement.query.count() == 0:
        print("Sembrando Logros...")
        achievements = [
            ('Primer Paso', 'Completa tu primera sesión de entrenamiento', 'emoji_events', 'sessions', 1, 100, 10),
            ('Constancia', 'Mantén una racha de 3 días', 'local_fire_department', 'streak', 3, 200, 20),
            ('Bestia del Hierro', 'Mueve más de 1000kg en una sesión', 'fitness_center', 'volume', 1000, 500, 50),
            ('Mentor', 'Asigna tu primera rutina como coach', 'school', 'coach', 1, 1000, 100)
        ]
        for name, desc, icon, cat, req, xp, coins in achievements:
            db.session.add(Achievement(name=name, description=desc, icon=icon, category=cat, requirement_value=req, xp_reward=xp, coins_reward=coins))
        print("✅ Logros sembrados.")

    db.session.commit()
    print("✨ Base de datos lista.")
