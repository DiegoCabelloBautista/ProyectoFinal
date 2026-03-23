from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import Routine, RoutineExercise, Exercise, db

routines_bp = Blueprint('routines', __name__)

@routines_bp.route('', methods=['GET'])
@jwt_required()
def get_routines():
    user_id = get_jwt_identity()
    routines = Routine.query.filter_by(user_id=user_id).all()
    return jsonify([{
        "id": r.id,
        "name": r.name,
        "description": r.description,
        "created_at": r.created_at.isoformat(),
        "is_public": r.is_public,
    } for r in routines]), 200


@routines_bp.route('', methods=['POST'])
@jwt_required()
def create_routine():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    routine = Routine(
        user_id=user_id,
        name=data['name'],
        description=data.get('description', ''),
        is_public=data.get('is_public', False),
    )

    db.session.add(routine)
    db.session.flush() # Get ID without committing
    
    # Add exercises if provided
    exercises_data = data.get('exercises', [])
    for idx, ex_data in enumerate(exercises_data):
        re = RoutineExercise(
            routine_id=routine.id,
            exercise_id=ex_data['exercise_id'],
            order=idx,
            sets=ex_data.get('sets', 3),
            reps_target=ex_data.get('reps_target', '8-12')
        )
        db.session.add(re)
    
    db.session.commit()
    return jsonify({"msg": "Rutina creada", "id": routine.id}), 201

@routines_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_routine(id):
    user_id = get_jwt_identity()
    routine = Routine.query.filter_by(id=id, user_id=user_id).first_or_404()
    db.session.delete(routine)
    db.session.commit()
    return jsonify({"msg": "Rutina eliminada"}), 200

@routines_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_routine_detail(id):
    """Obtener detalle completo de una rutina con sus ejercicios"""
    user_id = get_jwt_identity()
    routine = Routine.query.filter_by(id=id, user_id=user_id).first_or_404()
    
    # Obtener ejercicios de la rutina
    routine_exercises = db.session.query(
        RoutineExercise,
        Exercise
    ).join(
        Exercise, Exercise.id == RoutineExercise.exercise_id
    ).filter(
        RoutineExercise.routine_id == id
    ).order_by(
        RoutineExercise.order
    ).all()
    
    exercises_data = [
        {
            'id': re.id,
            'exercise_id': ex.id,
            'exercise_name': ex.name,
            'muscle_group': ex.muscle_group,
            'description': ex.description,
            'sets': re.sets,
            'reps_target': re.reps_target,
            'order': re.order
        }
        for re, ex in routine_exercises
    ]
    
    return jsonify({
        'id': routine.id,
        'name': routine.name,
        'description': routine.description,
        'created_at': routine.created_at.isoformat(),
        'exercises': exercises_data
    }), 200

@routines_bp.route('/<int:id>/publish', methods=['PATCH'])
@jwt_required()
def toggle_publish(id: int):
    """Publica o despublica una rutina propia en la comunidad."""
    user_id = get_jwt_identity()
    routine = Routine.query.filter_by(id=id, user_id=user_id).first_or_404()
    routine.is_public = not routine.is_public
    db.session.commit()
    state = 'publicada' if routine.is_public else 'privada'
    return jsonify({'msg': f'Rutina {state}', 'is_public': routine.is_public}), 200

@routines_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_routine():
    """Generador Inteligente de Rutinas (Cerebro Local + Fallback IA)"""
    import random
    from sqlalchemy import or_
    from ..models import Routine, RoutineExercise, Exercise, db
    
    user_id = get_jwt_identity()
    data = request.get_json()
    prompt = data.get('prompt', '').lower()
    
    # ... logic ...
    keywords = {
        'pecho': ['pecho', 'chest', 'empuje', 'push', 'press'],
        'espalda': ['espalda', 'back', 'tirón', 'pull', 'remo'],
        'pierna': ['pierna', 'leg', 'sentadilla', 'cuádriceps', 'glúteo'],
        'brazo': ['brazo', 'arm', 'bíceps', 'tríceps', 'bícep', 'trícep'],
        'hombro': ['hombro', 'shoulder', 'militar'],
        'core': ['core', 'abdomen', 'abs', 'abdominales']
    }

    target_muscles = []
    for muscle, words in keywords.items():
        if any(w in prompt for w in words):
            target_muscles.append(muscle)

    # Buscar ejercicios que coincidan con los keywords detectados
    if target_muscles:
        available_exercises = Exercise.query.filter(
            or_(*[Exercise.muscle_group.ilike(f'%{m}%') for m in target_muscles])
        ).all()
    else:
        # Si no detecta nada o pide Full Body, mezclamos un poco de todo
        available_exercises = Exercise.query.all()

    if not available_exercises:
        available_exercises = Exercise.query.all()

    # Seleccionar 5-6 ejercicios aleatorios del subconjunto o de todo el catálogo
    num_to_pick = min(len(available_exercises), random.randint(5, 7))
    selected = random.sample(available_exercises, num_to_pick)

    # Crear la rutina con un nombre chulo basado en el prompt
    routine_name = f"Rutina {data.get('prompt', 'Nueva').title()}"
    new_routine = Routine(
        user_id=user_id, 
        name=routine_name[:64], 
        description="Generada por el Asistente Inteligente de GymTrackPro.",
        is_public=False
    )
    db.session.add(new_routine)
    db.session.flush()

    for i, ex in enumerate(selected):
        re = RoutineExercise(
            routine_id=new_routine.id,
            exercise_id=ex.id,
            order=i,
            sets=random.choice([3, 4]),
            reps_target=random.choice(['8-10', '10-12', '12-15'])
        )
        db.session.add(re)
        
    db.session.commit()
    return jsonify({"msg": "Éxito", "id": new_routine.id, "name": new_routine.name}), 201
