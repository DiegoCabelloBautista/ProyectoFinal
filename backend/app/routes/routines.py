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
    """Generador Inteligente de Rutinas con IA (Gemini) y Fallback local"""
    import random, re, os, json
    import google.generativeai as genai
    from flask import current_app
    from ..models import Routine, RoutineExercise, Exercise, db

    user_id = get_jwt_identity()
    data = request.get_json()
    if not data:
        return jsonify({"msg": "No se proporcionaron datos"}), 400
        
    prompt = data.get('prompt', '').strip()
    num_exercises = int(data.get('num_exercises', 6))
    
    current_app.logger.info(f"🤖 Generando rutina para usuario {user_id}. Prompt: {prompt}")

    # --- 1. INTENTAR GENERACIÓN CON IA (GEMINI) ---
    api_key = os.environ.get('GEMINI_API_KEY')
    ai_success = False
    ai_exercises = []

    if api_key:
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            # Obtener lista de ejercicios disponibles para que la IA elija nombres exactos
            all_db_exercises = Exercise.query.all()
            exercise_names = [ex.name for ex in all_db_exercises]
            
            ai_prompt = f"""
            Actúa como un entrenador personal experto. El usuario quiere una rutina con este objetivo: "{prompt}".
            Tengo estos ejercicios disponibles en mi base de datos: {", ".join(exercise_names)}.
            
            Selecciona exactamente {num_exercises} ejercicios de la lista anterior que mejor se adapten al objetivo.
            Responde ÚNICAMENTE con un objeto JSON con este formato:
            {{
              "routine_name": "Nombre creativo de la rutina",
              "exercises": [
                {{"name": "Nombre exacto del ejercicio", "sets": 3, "reps": "10-12"}},
                ...
              ]
            }}
            """
            
            response = model.generate_content(ai_prompt)
            # Extraer JSON de la respuesta (a veces viene con markdown ```json)
            raw_text = response.text
            json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
            if json_match:
                ai_data = json.loads(json_match.group())
                routine_name = ai_data.get('routine_name', 'Rutina Personalizada IA')
                
                for ex_item in ai_data.get('exercises', []):
                    ex_obj = Exercise.query.filter_by(name=ex_item['name']).first()
                    if ex_obj:
                        ai_exercises.append({
                            'obj': ex_obj,
                            'sets': ex_item.get('sets', 3),
                            'reps': ex_item.get('reps', '10-12')
                        })
                
                if len(ai_exercises) > 0:
                    ai_success = True
                    current_app.logger.info(f"✨ IA generó con éxito {len(ai_exercises)} ejercicios.")
        except Exception as e:
            current_app.logger.error(f"❌ Error en Gemini AI: {str(e)}")
            ai_success = False

    # --- 2. FALLBACK A LÓGICA LOCAL (Si la IA falla o no hay API Key) ---
    if not ai_success:
        current_app.logger.info("⚠️ Usando lógica de fallback local...")
        prompt_low = prompt.lower()
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

        detected_groups = [group for group, kws in keyword_to_db.items() if any(kw in prompt_low for kw in kws)]
        
        if detected_groups:
            available = Exercise.query.filter(Exercise.muscle_group.in_(detected_groups)).all()
        else:
            available = Exercise.query.all()
            detected_groups = ['Full Body']

        if not available:
            return jsonify({"msg": "No hay ejercicios disponibles en la BD."}), 400

        n = min(num_exercises, len(available))
        selected_objs = random.sample(available, n)
        ai_exercises = [{'obj': ex, 'sets': random.choice([3, 4]), 'reps': random.choice(['8-10', '10-12'])} for ex in selected_objs]
        routine_name = f"Entrenamiento de {' · '.join(detected_groups[:3])}"

    # --- 3. GUARDAR EN BD ---
    try:
        new_routine = Routine(
            user_id=user_id,
            name=routine_name[:64],
            description="Generada por el Asistente Inteligente de GymTrackPro.",
            is_public=False
        )
        db.session.add(new_routine)
        db.session.flush()

        for i, item in enumerate(ai_exercises):
            re_obj = RoutineExercise(
                routine_id=new_routine.id,
                exercise_id=item['obj'].id,
                order=i,
                sets=item['sets'],
                reps_target=item['reps']
            )
            db.session.add(re_obj)

        db.session.commit()
        
        # Comprobar logros
        from ..utils.gamification import check_user_achievements
        check_user_achievements(user_id)
        
        return jsonify({"msg": "Éxito", "id": new_routine.id, "name": new_routine.name}), 201
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"💥 Error guardando rutina: {str(e)}")
        return jsonify({"msg": "Error interno al guardar la rutina", "error": str(e)}), 500
