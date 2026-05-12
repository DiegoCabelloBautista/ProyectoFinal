from app import create_app, db
from app.models import User, Exercise

app = create_app()

@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'User': User, 'Exercise': Exercise}

if __name__ == '__main__':
    import time
    from sqlalchemy.exc import OperationalError

    retries = 5
    while retries > 0:
        try:
            with app.app_context():
                print("Intentando conectar a DB y crear tablas...")
                db.create_all()
                
                # --- AUTO-SEED AGRESIVO (Borrar y Crear) ---
                from app.models import User
                from werkzeug.security import generate_password_hash
                
                # Definición de usuarios maestros
                master_users = [
                    {
                        'username': 'admin_gtp',
                        'email': 'admin@gtp.com',
                        'password': 'admin123',
                        'role': 'admin',
                        'icon': 'admin_panel_settings',
                        'color': '#EF4444'
                    },
                    {
                        'username': 'trainer_gtp',
                        'email': 'trainer@gtp.com',
                        'password': 'trainer123',
                        'role': 'trainer',
                        'icon': 'sports',
                        'color': '#10B981'
                    }
                ]

                for u_data in master_users:
                    # Borrar si existe para asegurar estado limpio
                    existing = User.query.filter_by(username=u_data['username']).first()
                    if existing:
                        db.session.delete(existing)
                        db.session.commit()
                    
                    # Crear de nuevo
                    print(f"Creando usuario maestro: {u_data['username']}...")
                    new_user = User(
                        username=u_data['username'],
                        email=u_data['email'],
                        password_hash=generate_password_hash(u_data['password']),
                        role=u_data['role'],
                        avatar_icon=u_data['icon'],
                        username_color=u_data['color'],
                        coins=1000 # Saldo inicial para pruebas
                    )
                    db.session.add(new_user)
                
                # --- AUTO-SEED EJERCICIOS (ADITIVO) ---
                from app.models import Exercise
                print("Verificando ejercicios básicos...")
                exercises = [
                    # PECHO (10)
                    ('Press de Banca con Barra', 'Pecho'), ('Press Inclinado con Mancuernas', 'Pecho'), ('Press Declinado', 'Pecho'), 
                    ('Aperturas en Polea', 'Pecho'), ('Flexiones (Push-ups)', 'Pecho'), ('Dips de Pecho (Fondos)', 'Pecho'),
                    ('Press de Pecho en Máquina', 'Pecho'), ('Aperturas con Mancuernas', 'Pecho'), ('Cruce de Poleas Altas', 'Pecho'),
                    ('Peck Deck (Aperturas Máquina)', 'Pecho'),
                    # ESPALDA (10)
                    ('Dominadas', 'Espalda'), ('Remo con Barra', 'Espalda'), ('Jalón al Pecho', 'Espalda'), 
                    ('Remo en Polea Baja', 'Espalda'), ('Pull-over en Polea', 'Espalda'), ('Hiperextensiones', 'Espalda'),
                    ('Remo con Mancuerna', 'Espalda'), ('Jalón tras Nuca', 'Espalda'), ('Peso Muerto Convencional', 'Espalda'),
                    ('Remo en Barra T', 'Espalda'),
                    # HOMBROS (10)
                    ('Press Militar con Barra', 'Hombros'), ('Elevaciones Laterales', 'Hombros'), ('Press Arnold', 'Hombros'),
                    ('Face Pulls', 'Hombros'), ('Pájaros (Posterior)', 'Hombros'), ('Encogimientos de Hombros', 'Hombros'),
                    ('Press Hombros Mancuernas', 'Hombros'), ('Elevaciones Frontales', 'Hombros'), ('Elevaciones Laterales Polea', 'Hombros'),
                    ('Remo al Cuello', 'Hombros'),
                    # PIERNAS - Cuádriceps (10)
                    ('Sentadillas con Barra', 'Piernas'), ('Prensa de Piernas', 'Piernas'), ('Extensión de Cuádriceps', 'Piernas'),
                    ('Zancadas (Lunges)', 'Piernas'), ('Sentadilla Búlgara', 'Piernas'), ('Step-ups con Mancuernas', 'Piernas'),
                    ('Sentadilla Hack', 'Piernas'), ('Goblet Squat', 'Piernas'), ('Extensiones a una pierna', 'Piernas'),
                    ('Sissy Squat', 'Piernas'),
                    # ISQUIOS (10)
                    ('Peso Muerto Rumano', 'Isquios'), ('Curl Femoral Tumbado', 'Isquios'), ('Curl Femoral Sentado', 'Isquios'),
                    ('Peso Muerto Sumo', 'Isquios'), ('Buenos Días (Good Mornings)', 'Isquios'), ('Curl Femoral a una mano', 'Isquios'),
                    ('Glute-Ham Raise', 'Isquios'), ('Nordic Curls', 'Isquios'), ('Peso Muerto con Mancuernas', 'Isquios'),
                    ('Puente de Isquios', 'Isquios'),
                    # GLÚTEOS (10)
                    ('Hip Thrust (Empuje Cadera)', 'Glúteos'), ('Patada de Glúteo en Polea', 'Glúteos'), ('Abductores en Máquina', 'Glúteos'),
                    ('Clamshells (Almejas)', 'Glúteos'), ('Monster Walk', 'Glúteos'), ('Fire Hydrants', 'Glúteos'),
                    ('Step-up Lateral', 'Glúteos'), ('Frog Pumps', 'Glúteos'), ('Sentadilla Sumo', 'Glúteos'),
                    ('Extensiones de Cadera Banco', 'Glúteos'),
                    # BÍCEPS (10)
                    ('Curl de Bíceps con Barra', 'Bíceps'), ('Martillo (Hammer Curl)', 'Bíceps'), ('Curl Predicador', 'Bíceps'),
                    ('Curl Mancuernas Alterno', 'Bíceps'), ('Curl Concentrado', 'Bíceps'), ('Curl en Polea Baja', 'Bíceps'),
                    ('Curl Spider (Araña)', 'Bíceps'), ('Curl Inclinado Mancuernas', 'Bíceps'), ('Zottman Curl', 'Bíceps'),
                    ('Curl con Barra Z', 'Bíceps'),
                    # TRÍCEPS (10)
                    ('Press Francés', 'Tríceps'), ('Extensión en Polea Alta', 'Tríceps'), ('Patada de Tríceps', 'Tríceps'),
                    ('Dips en Paralelas', 'Tríceps'), ('Press de Banca Cerrado', 'Tríceps'), ('Extensión tras nuca Mancuerna', 'Tríceps'),
                    ('Pushdown con Cuerda', 'Tríceps'), ('Skullcrushers con Mancuernas', 'Tríceps'), ('Extensión Polea a una mano', 'Tríceps'),
                    ('Fondos entre Bancos', 'Tríceps'),
                    # ABDOMINALES (10)
                    ('Plancha Abdominal', 'Abdominales'), ('Crunches (Encogimientos)', 'Abdominales'), ('Elevación de Piernas', 'Abdominales'),
                    ('Rueda Abdominal', 'Abdominales'), ('Twist Ruso', 'Abdominales'), ('Woodchoppers Polea', 'Abdominales'),
                    ('Deadbug', 'Abdominales'), ('Mountain Climbers', 'Abdominales'), ('Hanging Leg Raises', 'Abdominales'),
                    ('V-Ups (Abdominales V)', 'Abdominales'),
                    # CARDIO Y OTROS (10)
                    ('Burpees', 'Cardio'), ('Saltos al Cajón', 'Cardio'), ('Correr en Cinta', 'Cardio'),
                    ('Remo en Máquina', 'Cardio'), ('Elíptica', 'Cardio'), ('Bicicleta Estática', 'Cardio'),
                    ('Jumping Jacks', 'Cardio'), ('Salto a la Comba', 'Cardio'), ('Boxeo (Saco)', 'Cardio'),
                    ('Kettlebell Swings', 'Cardio')
                ]
                for name, group in exercises:
                    if not Exercise.query.filter_by(name=name).first():
                        db.session.add(Exercise(name=name, muscle_group=group))
                db.session.commit()

                # --- AUTO-SEED TIENDA (ADITIVO) ---
                from app.models import ShopItem
                print("Verificando Tienda...")
                items = [
                    # Avatares
                    ('Avatar: Atleta', 'Icono básico', 'avatar', 'person', 0, 1),
                    ('Avatar: Karateka', 'Icono de artes marciales', 'avatar', 'sports_martial_arts', 0, 1),
                    ('Avatar: Gimnasta', 'Icono de agilidad', 'avatar', 'sports_gymnastics', 0, 1),
                    ('Avatar: Pesista', 'Icono de fuerza', 'avatar', 'fitness_center', 50, 5),
                    ('Avatar: Zen', 'Icono de meditación', 'avatar', 'self_improvement', 100, 10),
                    ('Avatar: Luchador', 'Icono de combate', 'avatar', 'sports_kabaddi', 150, 15),
                    ('Avatar: MMA', 'Icono de octágono', 'avatar', 'sports_mma', 200, 20),
                    ('Avatar: Élite', 'Insignia de oficial militar', 'avatar', 'military_tech', 500, 30),
                    ('Avatar: Premium', 'Símbolo de prestigio', 'avatar', 'workspace_premium', 1000, 40),
                    ('Avatar: Leyenda', 'El diamante definitivo', 'avatar', 'diamond', 5000, 50),
                    # Colores
                    ('Color: Cyan', 'Estilo clásico', 'color', '#00C9FF', 0, 1),
                    ('Color: Esmeralda', 'Estilo natural', 'color', '#10B981', 0, 1),
                    ('Color: Índigo', 'Estilo profundo', 'color', '#6366F1', 0, 1),
                    ('Color: Ambar', 'Estilo energético', 'color', '#F59E0B', 50, 5),
                    ('Color: Rosa', 'Estilo vibrante', 'color', '#EC4899', 100, 10),
                    ('Color: Púrpura', 'Estilo místico', 'color', '#A855F7', 150, 15),
                    ('Color: Carmesí', 'Estilo furia', 'color', '#F43F5E', 250, 20),
                    ('Color: Naranja', 'Estilo fuego', 'color', '#FB923C', 400, 30),
                    ('Color: Turquesa', 'Estilo océano', 'color', '#2DD4BF', 600, 40),
                    ('Color: Dorado', 'Estilo Campeón', 'color', '#FFD700', 2000, 50),
                    # Objetos
                    ('Proteína Whey', 'Multiplicador XP 1.5x (5 sesiones)', 'consumable', 'multiplier_1.5_5', 100, 1),
                    ('Pre-Entreno', 'Multiplicador XP 2.0x (3 sesiones)', 'consumable', 'multiplier_2.0_3', 150, 5),
                    ('Escudo de Racha', 'Protege tu racha si fallas un día', 'consumable', 'streak_shield', 200, 1),
                    ('Creatina', 'Multiplicador XP 1.2x (10 sesiones)', 'consumable', 'multiplier_1.2_10', 120, 3),
                    ('Cinturón de Fuerza', 'Bonus XP fijo en ejercicios pesados', 'equipment', 'xp_flat_10', 500, 10),
                    ('Guantes Pro', 'Más agarre, más XP en tirones', 'equipment', 'xp_pull_5', 300, 5),
                    ('Zapatillas Haltero', 'Bonus XP en ejercicios de pierna', 'equipment', 'xp_leg_10', 800, 15),
                    ('Magnesio', 'Bonus XP total pequeño pero constante', 'equipment', 'xp_total_5', 100, 2),
                    ('Rodilleras', 'Menos fatiga, permite más volumen', 'equipment', 'volume_boost', 400, 12),
                    ('Muñequeras', 'Mejor empuje en presses', 'equipment', 'xp_push_5', 250, 8),
                    ('Comba Veloz', 'Más XP en ejercicios de Cardio', 'equipment', 'xp_cardio_15', 200, 1),
                    ('Rueda Abdominal', 'Más XP en ejercicios de Core', 'equipment', 'xp_core_20', 250, 4),
                    ('Mancuernas Oro', 'Objeto de lujo (Título: Coleccionista)', 'title', 'Coleccionista', 5000, 40),
                    ('Pase VIP', 'Título: VIP + Multiplicador Permanente', 'title', 'VIP', 10000, 50),
                    ('Botella Agua Pro', 'Recuperación ligeramente más rápida', 'consumable', 'recovery_boost', 50, 1)
                ]
                for name, desc, itype, val, price, lvl in items:
                    if not ShopItem.query.filter_by(name=name).first():
                        db.session.add(ShopItem(name=name, description=desc, item_type=itype, value=val, price=price, required_level=lvl))
                db.session.commit()

                # --- AUTO-SEED LOGROS (ADITIVO) ---
                from app.models import Achievement
                print("Verificando Logros...")
                achievements = [
                    ('Primer Paso', 'Completa tu primera sesión de entrenamiento', 'emoji_events', 'sessions', 1, 100, 10),
                    ('Constancia', 'Mantén una racha de 3 días', 'local_fire_department', 'streak', 3, 200, 20),
                    ('Guerrero Semanal', 'Completa 5 sesiones de entrenamiento', 'calendar_today', 'sessions', 5, 300, 30),
                    ('Bestia del Hierro', 'Mueve más de 1000kg en una sesión', 'fitness_center', 'volume', 1000, 500, 50),
                    ('Corazón de Acero', 'Completa 10 sesiones de cardio', 'Directions_run', 'cardio', 10, 400, 40),
                    ('Madrugador', 'Entrena antes de las 9:00 AM', 'wb_sunny', 'time', 1, 150, 15),
                    ('Noctámbulo', 'Entrena después de las 10:00 PM', 'dark_mode', 'time', 1, 150, 15),
                    ('Coleccionista', 'Compra 5 objetos en la tienda', 'shopping_cart', 'shop', 5, 500, 50),
                    ('Influencer', 'Recibe 10 likes en tus rutinas', 'favorite', 'social', 10, 600, 60),
                    ('Filántropo', 'Dale like a 20 rutinas de otros', 'thumb_up', 'social', 20, 200, 20),
                    ('Crítico', 'Deja 5 valoraciones en rutinas', 'star', 'reviews', 5, 200, 20),
                    ('Mentor', 'Asigna tu primera rutina como coach', 'school', 'coach', 1, 1000, 100),
                    ('Cuerpo de Élite', 'Alcanza el Nivel 20', 'workspace_premium', 'level', 20, 2000, 200),
                    ('Leyenda Viva', 'Alcanza el Nivel 50', 'diamond', 'level', 50, 10000, 1000),
                    ('Imparable', 'Mantén una racha de 30 días', 'auto_awesome', 'streak', 30, 5000, 500)
                ]
                for name, desc, icon, cat, req, xp, coins in achievements:
                    if not Achievement.query.filter_by(name=name).first():
                        db.session.add(Achievement(name=name, description=desc, icon=icon, category=cat, requirement_value=req, xp_reward=xp, coins_reward=coins))
                db.session.commit()

                db.session.commit()
                # --------------------------------------------
                
                print("Tablas y semilla verificadas. Conexión EXITOSA.")
            break
        except OperationalError as e:
            retries -= 1
            print(f"DB no lista. Reintentando en 5s... ({retries} intentos restantes)")
            time.sleep(5)
        except Exception as e:
            print(f"FATAL ERROR en run.py: {e}")
            import traceback
            traceback.print_exc()
            break
    
    if retries == 0:
        print("ADVERTENCIA: No se pudo conectar a la base de datos tras varios intentos.")
        print("Iniciando servidor Flask de todos modos (las peticiones podrían fallar)...")
    else:
        print("Iniciando servidor Flask...")
    
    # Iniciar siempre para que el contenedor no muera
    print("Rutas registradas:")
    print(app.url_map)
    app.run(host='0.0.0.0', port=5000, debug=False)
