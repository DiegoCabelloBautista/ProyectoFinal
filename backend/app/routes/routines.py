from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import Routine, RoutineExercise, Exercise, db

routines_bp = Blueprint('routines', __name__)

@routines_bp.route('', methods=['GET'])
@jwt_required()
def get_routines():
    user_id = get_jwt_identity()
    
    # 1. Obtener rutinas creadas por el usuario
    own_routines = Routine.query.filter_by(user_id=user_id).all()
    res = [{
        "id": r.id,
        "name": r.name,
        "description": r.description,
        "created_at": r.created_at.isoformat(),
        "is_public": r.is_public,
        "music_url": r.music_url,
        "is_assigned": False,
        "author": "Mí" # Opcional: indicar que es propia
    } for r in own_routines]
    
    # 2. Obtener rutinas guardadas o asignadas (de otros autores)
    from ..models import SavedRoutine
    saved = SavedRoutine.query.filter_by(user_id=user_id).all()
    for s in saved:
        r = Routine.query.get(s.original_routine_id)
        if r:
            res.append({
                "id": r.id,
                "name": r.name,
                "description": r.description,
                "created_at": r.created_at.isoformat(),
                "is_public": r.is_public,
                "music_url": r.music_url,
                "is_assigned": s.is_assigned,
                "author": r.author.username if r.author else "Desconocido",
                "is_verified": r.author.role in ['admin', 'trainer'] if r.author else False
            })
            
    return jsonify(res), 200


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
        music_url=data.get('music_url', None),
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
    
    # Comprobar logros (Creación de rutinas)
    from ..utils.gamification import check_user_achievements
    check_user_achievements(user_id)
    
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
        'music_url': routine.music_url,
        'exercises': exercises_data
    }), 200

@routines_bp.route('/<int:id>/music', methods=['PATCH'])
@jwt_required()
def update_music(id: int):
    """Actualiza la URL de música asociada a una rutina."""
    user_id = get_jwt_identity()
    routine = Routine.query.filter_by(id=id, user_id=user_id).first_or_404()
    data = request.get_json()
    routine.music_url = data.get('music_url', '')
    db.session.commit()
    return jsonify({'msg': 'Música actualizada', 'music_url': routine.music_url}), 200

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
    """Generador Inteligente de Rutinas con distribución por músculo"""
    import random, re
    from flask import current_app
    from ..models import Routine, RoutineExercise, Exercise, db

    user_id = get_jwt_identity()
    data = request.get_json()
    prompt = data.get('prompt', '').lower().strip()
    num_exercises = int(data.get('num_exercises', 6))
    
    current_app.logger.info(f"🤖 Iniciando generación de rutina para usuario {user_id}. Prompt: {prompt}")

    # ── Mapa keyword → nombre exacto en BD ─────────────────────────────────
    keyword_to_db = {
        'Pecho':       ['pecho', 'chest', 'empuje', 'push', 'press', 'pectoral'],
        'Espalda':     ['espalda', 'back', 'tiron', 'tirón', 'pull', 'remo', 'lats', 'dorsal'],
        'Hombros':     ['hombro', 'hombros', 'shoulder', 'deltoid', 'militar', 'posterior', 'deltoide'],
        'Bíceps':      ['bicep', 'bícep', 'biceps', 'bíceps', 'bic'],
        'Tríceps':     ['tricep', 'trícep', 'triceps', 'tríceps', 'tric'],
        'Piernas':     ['pierna', 'piernas', 'leg', 'legs', 'sentadilla', 'cuadriceps', 'cuádriceps', 'isquio', 'quad'],
        'Glúteos':     ['gluteo', 'glúteo', 'gluteos', 'glúteos', 'cadera', 'hip'],
        'Abdominales': ['core', 'abdomen', 'abs', 'abdominal', 'abdominales', 'oblicuo'],
        'Gemelos':     ['gemelo', 'gemelos', 'pantorrilla', 'calf'],
        'Cardio':      ['cardio', 'aerobico', 'aeróbico', 'correr', 'hiit'],
    }

    def keyword_to_group(word):
        """Devuelve el nombre del grupo muscular en BD dado una keyword."""
        for db_group, keywords in keyword_to_db.items():
            if word in keywords:
                return db_group
        return None

    # ── Nombres de entrenamiento según músculos ─────────────────────────────
    combo_names = {
        frozenset(['Pecho', 'Tríceps']):              'Push Day — Pecho y Tríceps',
        frozenset(['Pecho', 'Tríceps', 'Hombros']):   'Push Day — Pecho, Hombros y Tríceps',
        frozenset(['Espalda', 'Bíceps']):             'Pull Day — Espalda y Bíceps',
        frozenset(['Espalda', 'Bíceps', 'Hombros']): 'Pull Day — Espalda, Hombros y Bíceps',
        frozenset(['Piernas']):                        'Leg Day',
        frozenset(['Piernas', 'Glúteos']):            'Leg Day — Piernas y Glúteos',
        frozenset(['Glúteos']):                        'Glute Day',
        frozenset(['Abdominales']):                    'Core Day',
        frozenset(['Hombros']):                        'Shoulder Day',
        frozenset(['Pecho']):                          'Chest Day',
        frozenset(['Espalda']):                        'Back Day',
        frozenset(['Bíceps', 'Tríceps']):             'Arm Day — Bíceps y Tríceps',
    }

    def build_name(groups):
        key = frozenset(groups)
        if key in combo_names:
            return combo_names[key]
        parts = list(groups)[:3]
        return 'Entrenamiento de ' + ' · '.join(parts)

    # ── 1. Intentar detectar distribución explícita: "3 pecho 2 tricep 1 hombro"
    # Patrón: dígito seguido (opcionalmente de "de") y luego una palabra
    explicit = re.findall(r'(\d+)\s+(?:de\s+)?([a-záéíóúüñ]+)', prompt)

    selected = []
    detected_groups = []

    if explicit:
        for count_str, muscle_word in explicit:
            db_group = keyword_to_group(muscle_word)
            if db_group:
                count = int(count_str)
                group_pool = Exercise.query.filter_by(muscle_group=db_group).all()
                if group_pool:
                    to_pick = min(count, len(group_pool))
                    picked = random.sample(group_pool, to_pick)
                    selected.extend(picked)
                    if db_group not in detected_groups:
                        detected_groups.append(db_group)

    # ── 2. Fallback: detección por keywords + num_exercises ─────────────────
    if not selected:
        target_db_groups = set()
        for db_group, keywords in keyword_to_db.items():
            if any(kw in prompt for kw in keywords):
                target_db_groups.add(db_group)

        if target_db_groups:
            available = Exercise.query.filter(
                Exercise.muscle_group.in_(list(target_db_groups))
            ).all()
            detected_groups = list(target_db_groups)
        else:
            available = Exercise.query.all()
            detected_groups = ['Full Body']

        if not available:
            available = Exercise.query.all()

        if not available:
            return jsonify({"msg": "No hay ejercicios en la BD."}), 400

        n = max(1, min(num_exercises, len(available)))
        selected = random.sample(available, n)

    if not selected:
        return jsonify({"msg": "No se pudieron seleccionar ejercicios con esos criterios."}), 400

    # ── 3. Nombre limpio ────────────────────────────────────────────────────
    routine_name = build_name(detected_groups)

    # ── 4. Guardar en BD ────────────────────────────────────────────────────
    new_routine = Routine(
        user_id=user_id,
        name=routine_name[:64],
        description="Generada por el Asistente Inteligente de GymTrackPro.",
        is_public=False
    )
    db.session.add(new_routine)
    db.session.flush()

    for i, ex in enumerate(selected):
        re_obj = RoutineExercise(
            routine_id=new_routine.id,
            exercise_id=ex.id,
            order=i,
            sets=random.choice([3, 4]),
            reps_target=random.choice(['8-10', '10-12', '12-15'])
        )
        db.session.add(re_obj)

    db.session.commit()
    
    # Comprobar logros (Creación de rutinas via AI)
    from ..utils.gamification import check_user_achievements
    check_user_achievements(user_id)
    
    return jsonify({"msg": "Éxito", "id": new_routine.id, "name": new_routine.name}), 201
