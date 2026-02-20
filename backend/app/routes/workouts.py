from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import WorkoutSession, WorkoutLog, db
from datetime import datetime

workouts_bp = Blueprint('workouts', __name__)

@workouts_bp.route('/sessions', methods=['GET'])
@jwt_required()
def get_sessions():
    user_id = get_jwt_identity()
    sessions = WorkoutSession.query.filter_by(user_id=user_id).order_by(WorkoutSession.start_time.desc()).all()
    return jsonify([{
        "id": s.id,
        "routine_id": s.routine_id,
        "start_time": s.start_time.isoformat(),
        "end_time": s.end_time.isoformat() if s.end_time else None
    } for s in sessions]), 200

@workouts_bp.route('/sessions', methods=['POST'])
@jwt_required()
def start_session():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    session = WorkoutSession(
        user_id=user_id,
        routine_id=data.get('routine_id'),
        start_time=datetime.utcnow()
    )
    db.session.add(session)
    db.session.commit()
    return jsonify({"msg": "Sesión iniciada", "id": session.id}), 201

@workouts_bp.route('/sessions/<int:id>/finish', methods=['POST'])
@jwt_required()
def finish_session(id):
    user_id = get_jwt_identity()
    session = WorkoutSession.query.filter_by(id=id, user_id=user_id).first_or_404()
    session.end_time = datetime.utcnow()
    
    # Calcular XP ganada basada en la sesión
    from ..models import WorkoutLog, User
    logs = WorkoutLog.query.filter_by(session_id=id).all()
    
    # XP base por completar sesión
    xp_gained = 20
    
    # XP adicional por volumen (1 XP por cada 100kg levantados)
    total_volume = sum(log.weight * log.reps for log in logs)
    xp_gained += int(total_volume / 100)
    
    # XP adicional por número de ejercicios únicos
    unique_exercises = len(set(log.exercise_id for log in logs))
    xp_gained += unique_exercises * 5
    
    # Dar XP al usuario y actualizar racha
    user = User.query.get(user_id)
    prev_longest = user.longest_streak or 0
    
    level_up_info = user.add_xp(xp_gained)
    streak_info = user.update_streak()
    
    db.session.commit()
    
    response = {
        "msg": "Sesión finalizada",
        "xp_gained": xp_gained,
        "total_xp": user.xp,
        "level": user.level,
        "current_streak": streak_info['current_streak'],
        "longest_streak": streak_info['longest_streak'],
        # True solo cuando se bate el récord personal de racha
        "streak_milestone": streak_info['streak_updated'] and streak_info['longest_streak'] > prev_longest,
    }
    
    if level_up_info['level_up']:
        response['level_up'] = True
        response['new_level'] = level_up_info['new_level']
        response['coins_earned'] = level_up_info['coins_earned']
    
    return jsonify(response), 200

@workouts_bp.route('/logs', methods=['POST'])
@jwt_required()
def log_set():
    data = request.get_json()
    log = WorkoutLog(
        session_id=data['session_id'],
        exercise_id=data['exercise_id'],
        set_number=data['set_number'],
        weight=data['weight'],
        reps=data['reps'],
        rpe=data.get('rpe')
    )
    db.session.add(log)
    db.session.commit()
    return jsonify({"msg": "Serie registrada", "id": log.id}), 201

@workouts_bp.route('/sessions/<int:id>', methods=['GET'])
@jwt_required()
def get_session_detail(id):
    """Obtener detalle completo de una sesión con todos sus logs"""
    user_id = get_jwt_identity()
    session = WorkoutSession.query.filter_by(id=id, user_id=user_id).first_or_404()
    
    # Obtener logs agrupados por ejercicio
    from sqlalchemy import func
    from ..models import Exercise
    
    logs = db.session.query(
        Exercise.id,
        Exercise.name,
        WorkoutLog.set_number,
        WorkoutLog.weight,
        WorkoutLog.reps,
        WorkoutLog.rpe,
        WorkoutLog.timestamp
    ).join(
        WorkoutLog, WorkoutLog.exercise_id == Exercise.id
    ).filter(
        WorkoutLog.session_id == id
    ).order_by(
        WorkoutLog.timestamp
    ).all()
    
    # Calcular volumen total
    total_volume = sum(log.weight * log.reps for log in logs)
    
    # Agrupar por ejercicio
    from collections import defaultdict
    exercises_data = defaultdict(list)
    for log in logs:
        exercises_data[log.id].append({
            'set_number': log.set_number,
            'weight': log.weight,
            'reps': log.reps,
            'rpe': log.rpe,
            'timestamp': log.timestamp.isoformat()
        })
    
    exercise_summary = [
        {
            'exercise_id': ex_id,
            'exercise_name': logs[0].name if logs else 'Unknown',
            'sets': exercises_data[ex_id]
        }
        for ex_id in exercises_data.keys()
    ]
    
    # Calcular duración
    duration_minutes = None
    if session.end_time:
        duration_seconds = (session.end_time - session.start_time).total_seconds()
        duration_minutes = round(duration_seconds / 60, 1)
    
    return jsonify({
        'id': session.id,
        'routine_id': session.routine_id,
        'start_time': session.start_time.isoformat(),
        'end_time': session.end_time.isoformat() if session.end_time else None,
        'duration_minutes': duration_minutes,
        'total_volume': round(total_volume, 2),
        'exercises': exercise_summary
    }), 200

