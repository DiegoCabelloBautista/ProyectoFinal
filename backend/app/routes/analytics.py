from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from ..models import WorkoutSession, WorkoutLog, Exercise, Routine, db
from collections import defaultdict

analytics_bp = Blueprint('analytics', __name__)

def calculate_1rm(weight: float, reps: int) -> float:
    """Calcula el 1RM usando la fórmula de Epley"""
    if reps == 1:
        return weight
    return weight * (1 + reps / 30.0)

@analytics_bp.route('/volume', methods=['GET'])
@jwt_required()
def get_volume_analytics():
    """
    Retorna el volumen total por grupo muscular en un periodo de tiempo.
    Query params: days (default 30)
    """
    user_id = get_jwt_identity()
    days = request.args.get('days', 30, type=int)
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Obtener sesiones del usuario en el periodo
    sessions = WorkoutSession.query.filter(
        WorkoutSession.user_id == user_id,
        WorkoutSession.start_time >= start_date
    ).all()
    
    session_ids = [s.id for s in sessions]
    
    # Calcular volumen por grupo muscular
    volume_by_muscle = db.session.query(
        Exercise.muscle_group,
        func.sum(WorkoutLog.weight * WorkoutLog.reps).label('total_volume')
    ).join(
        WorkoutLog, WorkoutLog.exercise_id == Exercise.id
    ).filter(
        WorkoutLog.session_id.in_(session_ids)
    ).group_by(
        Exercise.muscle_group
    ).all()
    
    result = [
        {
            "muscle_group": muscle or "Sin categoría",
            "volume": float(volume or 0)
        }
        for muscle, volume in volume_by_muscle
    ]
    
    return jsonify(result), 200

@analytics_bp.route('/progression/<int:exercise_id>', methods=['GET'])
@jwt_required()
def get_exercise_progression(exercise_id):
    """
    Retorna la progresión de 1RM estimado de un ejercicio específico.
    """
    user_id = get_jwt_identity()
    days = request.args.get('days', 90, type=int)
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Obtener todos los logs del ejercicio
    logs = db.session.query(
        WorkoutLog.timestamp,
        WorkoutLog.weight,
        WorkoutLog.reps
    ).join(
        WorkoutSession, WorkoutSession.id == WorkoutLog.session_id
    ).filter(
        WorkoutSession.user_id == user_id,
        WorkoutLog.exercise_id == exercise_id,
        WorkoutLog.timestamp >= start_date
    ).order_by(WorkoutLog.timestamp).all()
    
    # Calcular 1RM para cada log y agrupar por día (tomar el máximo del día)
    daily_1rm = defaultdict(float)
    for log in logs:
        date_key = log.timestamp.date().isoformat()
        estimated_1rm = calculate_1rm(log.weight, log.reps)
        daily_1rm[date_key] = max(daily_1rm[date_key], estimated_1rm)
    
    progression = [
        {"date": date, "estimated_1rm": round(max_1rm, 2)}
        for date, max_1rm in sorted(daily_1rm.items())
    ]
    
    return jsonify(progression), 200

@analytics_bp.route('/personal-records', methods=['GET'])
@jwt_required()
def get_personal_records():
    """
    Detecta y retorna los récords personales (PRs) del usuario.
    Un PR es el mayor 1RM estimado para cada ejercicio.
    """
    user_id = get_jwt_identity()
    
    # Obtener todos los logs del usuario
    logs = db.session.query(
        Exercise.id,
        Exercise.name,
        Exercise.muscle_group,
        WorkoutLog.weight,
        WorkoutLog.reps,
        WorkoutLog.timestamp
    ).join(
        WorkoutSession, WorkoutSession.id == WorkoutLog.session_id
    ).join(
        Exercise, Exercise.id == WorkoutLog.exercise_id
    ).filter(
        WorkoutSession.user_id == user_id
    ).all()
    
    # Calcular PRs por ejercicio
    prs = {}
    for log in logs:
        exercise_id = log.id
        estimated_1rm = calculate_1rm(log.weight, log.reps)
        
        if exercise_id not in prs or estimated_1rm > prs[exercise_id]['estimated_1rm']:
            prs[exercise_id] = {
                'exercise_id': exercise_id,
                'exercise_name': log.name,
                'muscle_group': log.muscle_group,
                'estimated_1rm': round(estimated_1rm, 2),
                'weight': log.weight,
                'reps': log.reps,
                'date': log.timestamp.isoformat()
            }
    
    return jsonify(list(prs.values())), 200

@analytics_bp.route('/heatmap', methods=['GET'])
@jwt_required()
def get_training_heatmap():
    """
    Retorna un mapa de frecuencia de entrenamiento (días entrenados).
    Query params: days (default 365)
    """
    user_id = get_jwt_identity()
    days = request.args.get('days', 365, type=int)
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Obtener sesiones agrupadas por fecha
    sessions = db.session.query(
        func.date(WorkoutSession.start_time).label('date'),
        func.count(WorkoutSession.id).label('session_count')
    ).filter(
        WorkoutSession.user_id == user_id,
        WorkoutSession.start_time >= start_date
    ).group_by(
        func.date(WorkoutSession.start_time)
    ).all()
    
    heatmap = [
        {
            "date": session.date.isoformat(),
            "count": session.session_count
        }
        for session in sessions
    ]
    
    return jsonify(heatmap), 200

@analytics_bp.route('/stats-summary', methods=['GET'])
@jwt_required()
def get_stats_summary():
    """
    Retorna un resumen de estadísticas generales del usuario.
    """
    user_id = get_jwt_identity()
    
    # Total de sesiones
    total_sessions = WorkoutSession.query.filter_by(user_id=user_id).count()
    
    # Sesiones en los últimos 30 días
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_sessions = WorkoutSession.query.filter(
        WorkoutSession.user_id == user_id,
        WorkoutSession.start_time >= thirty_days_ago
    ).count()
    
    # Volumen total levantado (histórico)
    total_volume = db.session.query(
        func.sum(WorkoutLog.weight * WorkoutLog.reps)
    ).join(
        WorkoutSession, WorkoutSession.id == WorkoutLog.session_id
    ).filter(
        WorkoutSession.user_id == user_id
    ).scalar() or 0
    
    # Ejercicio más frecuente
    most_common_exercise = db.session.query(
        Exercise.name,
        func.count(WorkoutLog.id).label('count')
    ).join(
        WorkoutLog, WorkoutLog.exercise_id == Exercise.id
    ).join(
        WorkoutSession, WorkoutSession.id == WorkoutLog.session_id
    ).filter(
        WorkoutSession.user_id == user_id
    ).group_by(
        Exercise.name
    ).order_by(
        desc('count')
    ).first()
    
    return jsonify({
        'total_sessions': total_sessions,
        'recent_sessions': recent_sessions,
        'total_volume_kg': round(float(total_volume), 2),
        'favorite_exercise': most_common_exercise[0] if most_common_exercise else "N/A"
    }), 200

@analytics_bp.route('/weekly-volume', methods=['GET'])
@jwt_required()
def get_weekly_volume():
    """
    Retorna el volumen total por semana en las últimas 12 semanas.
    """
    user_id = get_jwt_identity()
    weeks = request.args.get('weeks', 12, type=int)
    start_date = datetime.utcnow() - timedelta(weeks=weeks)
    
    # Obtener logs agrupados por semana
    weekly_data = db.session.query(
        func.year(WorkoutLog.timestamp).label('year'),
        func.week(WorkoutLog.timestamp).label('week'),
        func.sum(WorkoutLog.weight * WorkoutLog.reps).label('volume')
    ).join(
        WorkoutSession, WorkoutSession.id == WorkoutLog.session_id
    ).filter(
        WorkoutSession.user_id == user_id,
        WorkoutLog.timestamp >= start_date
    ).group_by(
        'year', 'week'
    ).order_by(
        'year', 'week'
    ).all()
    
    result = [
        {
            "week": f"{data.year}-W{data.week:02d}",
            "volume": round(float(data.volume or 0), 2)
        }
        for data in weekly_data
    ]
    
    return jsonify(result), 200
