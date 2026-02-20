from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import (
    db, Routine, RoutineExercise, Exercise,
    RoutineLike, SavedRoutine, User
)

community_bp = Blueprint('community', __name__)


def _serialize_routine(routine: Routine, current_user_id: int) -> dict:
    """Serializa una rutina pública con info de autor, likes y estado del usuario."""
    like_count = len(routine.likes)
    user_liked = any(l.user_id == current_user_id for l in routine.likes)
    user_saved = SavedRoutine.query.filter_by(
        user_id=current_user_id,
        original_routine_id=routine.id
    ).first() is not None

    exercise_count = RoutineExercise.query.filter_by(routine_id=routine.id).count()
    author = User.query.get(routine.user_id)

    return {
        'id': routine.id,
        'name': routine.name,
        'description': routine.description,
        'created_at': routine.created_at.isoformat(),
        'exercise_count': exercise_count,
        'likes': like_count,
        'user_liked': user_liked,
        'user_saved': user_saved,
        'is_own': routine.user_id == current_user_id,
        'author': {
            'id': author.id,
            'username': author.username,
            'level': author.level,
            'avatar_icon': author.avatar_icon,
            'username_color': author.username_color,
        } if author else None,
    }


@community_bp.route('', methods=['GET'])
@jwt_required()
def get_feed():
    """Feed de rutinas públicas ordenadas por likes desc."""
    current_user_id = get_jwt_identity()
    routines = (
        Routine.query
        .filter_by(is_public=True)
        .order_by(Routine.created_at.desc())
        .all()
    )
    return jsonify([_serialize_routine(r, current_user_id) for r in routines]), 200


@community_bp.route('/routines/<int:routine_id>/like', methods=['POST'])
@jwt_required()
def toggle_like(routine_id: int):
    """Toggle like en una rutina pública. Devuelve el nuevo estado."""
    current_user_id = get_jwt_identity()
    routine = Routine.query.filter_by(id=routine_id, is_public=True).first_or_404()

    existing = RoutineLike.query.filter_by(
        user_id=current_user_id,
        routine_id=routine_id
    ).first()

    if existing:
        db.session.delete(existing)
        liked = False
    else:
        db.session.add(RoutineLike(user_id=current_user_id, routine_id=routine_id))
        liked = True

    db.session.commit()
    like_count = RoutineLike.query.filter_by(routine_id=routine_id).count()
    return jsonify({'liked': liked, 'likes': like_count}), 200


@community_bp.route('/routines/<int:routine_id>/save', methods=['POST'])
@jwt_required()
def save_routine(routine_id: int):
    """
    Guarda una rutina pública en la colección del usuario actual
    clonando todos sus ejercicios. Toggle: si ya la tiene, la elimina.
    """
    current_user_id = get_jwt_identity()
    routine = Routine.query.filter_by(id=routine_id, is_public=True).first_or_404()

    # No puede guardar su propia rutina
    if routine.user_id == current_user_id:
        return jsonify({'msg': 'No puedes guardar tu propia rutina'}), 400

    existing = SavedRoutine.query.filter_by(
        user_id=current_user_id,
        original_routine_id=routine_id
    ).first()

    if existing:
        db.session.delete(existing)
        db.session.commit()
        return jsonify({'saved': False, 'msg': 'Rutina eliminada de tu colección'}), 200

    # Clonar la rutina en la cuenta del usuario actual
    clone = Routine(
        user_id=current_user_id,
        name=f"{routine.name} (de {User.query.get(routine.user_id).username})",
        description=routine.description,
        is_public=False,
    )
    db.session.add(clone)
    db.session.flush()

    original_exercises = RoutineExercise.query.filter_by(routine_id=routine_id).all()
    for ex in original_exercises:
        db.session.add(RoutineExercise(
            routine_id=clone.id,
            exercise_id=ex.exercise_id,
            order=ex.order,
            sets=ex.sets,
            reps_target=ex.reps_target,
        ))

    db.session.add(SavedRoutine(
        user_id=current_user_id,
        original_routine_id=routine_id,
    ))
    db.session.commit()
    return jsonify({'saved': True, 'msg': 'Rutina guardada en tu colección', 'new_routine_id': clone.id}), 201


@community_bp.route('/routines/<int:routine_id>/exercises', methods=['GET'])
@jwt_required()
def get_routine_exercises(routine_id: int):
    """Detalle de ejercicios de una rutina pública."""
    routine = Routine.query.filter_by(id=routine_id, is_public=True).first_or_404()
    rows = (
        db.session.query(RoutineExercise, Exercise)
        .join(Exercise, Exercise.id == RoutineExercise.exercise_id)
        .filter(RoutineExercise.routine_id == routine_id)
        .order_by(RoutineExercise.order)
        .all()
    )
    return jsonify([{
        'exercise_name': ex.name,
        'muscle_group': ex.muscle_group,
        'sets': re.sets,
        'reps_target': re.reps_target,
    } for re, ex in rows]), 200
