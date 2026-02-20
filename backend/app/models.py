from . import db
from datetime import datetime, date, timedelta
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Gamificación
    xp = db.Column(db.Integer, default=0)  # Puntos de experiencia
    level = db.Column(db.Integer, default=1)  # Nivel del usuario
    coins = db.Column(db.Integer, default=0)  # Monedas virtuales para canjear

    # Rachas de entrenamiento
    current_streak = db.Column(db.Integer, default=0)  # Días consecutivos activos
    longest_streak = db.Column(db.Integer, default=0)  # Mejor racha histórica
    last_workout_date = db.Column(db.Date, default=None)  # Último día con sesión
    
    # Personalización Premium
    avatar_icon = db.Column(db.String(50), default='person')  # Icono de avatar
    username_color = db.Column(db.String(20), default='#00C9FF')  # Color del nombre
    is_verified = db.Column(db.Boolean, default=False)  # Badge verificado
    title = db.Column(db.String(50), default=None)  # Título (ej: "Iron Warrior")

    routines = db.relationship('Routine', backref='author', lazy='dynamic')
    sessions = db.relationship('WorkoutSession', backref='user', lazy='dynamic')
    achievements = db.relationship('UserAchievement', backref='user', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def add_xp(self, amount):
        """Añadir XP y subir de nivel si es necesario"""
        if self.xp is None: self.xp = 0
        if self.level is None: self.level = 1
        if self.coins is None: self.coins = 0
        
        self.xp += amount
        new_level = self.calculate_level()
        
        # Si sube de nivel, dar recompensas
        if new_level > self.level:
            levels_gained = new_level - self.level
            self.level = new_level
            self.coins += levels_gained * 10  # 10 monedas por nivel
            return {'level_up': True, 'new_level': new_level, 'coins_earned': levels_gained * 10}
        
        return {'level_up': False}
    
    def calculate_level(self):
        """Calcular nivel basado en XP (fórmula exponencial)"""
        # Nivel = raíz cuadrada de (XP / 100)
        import math
        current_xp = self.xp if self.xp is not None else 0
        return int(math.sqrt(current_xp / 100)) + 1
    
    def xp_for_next_level(self):
        """Calcular XP necesaria para el siguiente nivel"""
        current_level = self.level if self.level is not None else 1
        next_level = current_level + 1
        return (next_level - 1) ** 2 * 100
    
    def xp_progress_percentage(self):
        """Porcentaje de progreso hacia el siguiente nivel"""
        current_level = self.level if self.level is not None else 1
        current_xp = self.xp if self.xp is not None else 0
        
        current_level_xp = (current_level - 1) ** 2 * 100
        next_level_xp = self.xp_for_next_level()
        
        if next_level_xp == current_level_xp: return 100 # Evitar div por cero si algo raro pasa
        
        progress = ((current_xp - current_level_xp) / (next_level_xp - current_level_xp)) * 100
        return min(progress, 100)

    def update_streak(self) -> dict:
        """Actualiza la racha diaria al finalizar una sesión.
        
        Reglas:
        - Si ya entrenó hoy → no modifica (evita doble conteo).
        - Si entrenó ayer → incrementa la racha.
        - Si no entrenó ayer ni hoy → resetea a 1.
        
        Returns dict con current_streak, longest_streak y si es una nueva racha.
        """
        today = date.today()
        yesterday = today - timedelta(days=1)

        if self.last_workout_date == today:
            # Ya se registró sesión hoy, no hace falta actualizar
            return {
                'current_streak': self.current_streak,
                'longest_streak': self.longest_streak,
                'streak_updated': False,
            }

        if self.last_workout_date == yesterday:
            self.current_streak = (self.current_streak or 0) + 1
        else:
            # Racha rota o primera sesión
            self.current_streak = 1

        self.last_workout_date = today

        if self.current_streak > (self.longest_streak or 0):
            self.longest_streak = self.current_streak

        return {
            'current_streak': self.current_streak,
            'longest_streak': self.longest_streak,
            'streak_updated': True,
        }

class Exercise(db.Model):
    __tablename__ = 'exercises'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    muscle_group = db.Column(db.String(50))
    description = db.Column(db.Text)
    image_url = db.Column(db.String(255))  # URL o path de la imagen del ejercicio

class Routine(db.Model):
    __tablename__ = 'routines'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_public = db.Column(db.Boolean, default=False)  # Publicada en comunidad

    exercises = db.relationship('RoutineExercise', backref='routine', cascade='all, delete-orphan')
    likes = db.relationship('RoutineLike', backref='routine', cascade='all, delete-orphan')

class RoutineExercise(db.Model):
    __tablename__ = 'routine_exercises'
    id = db.Column(db.Integer, primary_key=True)
    routine_id = db.Column(db.Integer, db.ForeignKey('routines.id'), nullable=False)
    exercise_id = db.Column(db.Integer, db.ForeignKey('exercises.id'), nullable=False)
    order = db.Column(db.Integer)
    sets = db.Column(db.Integer, default=3)
    reps_target = db.Column(db.String(20)) # e.g. "8-12"

class WorkoutSession(db.Model):
    __tablename__ = 'workout_sessions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    routine_id = db.Column(db.Integer, db.ForeignKey('routines.id'))
    start_time = db.Column(db.DateTime, default=datetime.utcnow)
    end_time = db.Column(db.DateTime)
    
    logs = db.relationship('WorkoutLog', backref='session', cascade='all, delete-orphan')

class WorkoutLog(db.Model):
    __tablename__ = 'workout_logs'
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('workout_sessions.id'), nullable=False)
    exercise_id = db.Column(db.Integer, db.ForeignKey('exercises.id'), nullable=False)
    set_number = db.Column(db.Integer, nullable=False)
    weight = db.Column(db.Float)
    reps = db.Column(db.Integer)
    rpe = db.Column(db.Integer)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# Sistema de Logros/Achievements
class Achievement(db.Model):
    __tablename__ = 'achievements'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    icon = db.Column(db.String(50), default='emoji_events')
    category = db.Column(db.String(50))  # 'sessions', 'volume', 'streak', etc.
    requirement_value = db.Column(db.Integer)  # Valor necesario para desbloquear
    xp_reward = db.Column(db.Integer, default=50)
    coins_reward = db.Column(db.Integer, default=5)

class UserAchievement(db.Model):
    __tablename__ = 'user_achievements'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    achievement_id = db.Column(db.Integer, db.ForeignKey('achievements.id'), nullable=False)
    unlocked_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # La relación 'user' ya está definida por el backref en User.achievements
    achievement = db.relationship('Achievement') # Esta sí es necesaria porque Achievement no tiene backref

# Tienda de Premios
class ShopItem(db.Model):
    __tablename__ = 'shop_items'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    item_type = db.Column(db.String(50))  # 'avatar', 'color', 'title', 'badge'
    value = db.Column(db.String(100))  # El valor del item (ej: color hex, icono, etc)
    price = db.Column(db.Integer, nullable=False)  # Precio en monedas
    is_active = db.Column(db.Boolean, default=True)
    required_level = db.Column(db.Integer, default=1)  # Nivel mínimo para desbloquear


# ── Comunidad ──────────────────────────────────────────────────────────────────

class RoutineLike(db.Model):
    """Un usuario le da like a una rutina pública."""
    __tablename__ = 'routine_likes'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    routine_id = db.Column(db.Integer, db.ForeignKey('routines.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    __table_args__ = (db.UniqueConstraint('user_id', 'routine_id', name='uq_like'),)


class SavedRoutine(db.Model):
    """Un usuario guarda (clona) una rutina pública en su colección."""
    __tablename__ = 'saved_routines'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    original_routine_id = db.Column(db.Integer, db.ForeignKey('routines.id'), nullable=False)
    saved_at = db.Column(db.DateTime, default=datetime.utcnow)
    __table_args__ = (db.UniqueConstraint('user_id', 'original_routine_id', name='uq_save'),)
