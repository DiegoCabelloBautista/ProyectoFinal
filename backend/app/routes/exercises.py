from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from ..models import Exercise, db

exercises_bp = Blueprint('exercises', __name__)

@exercises_bp.route('', methods=['GET'])
def get_exercises():
    muscle_group = request.args.get('muscle_group')
    query = Exercise.query
    if muscle_group:
        query = query.filter_by(muscle_group=muscle_group)
    
    exercises = query.all()
    return jsonify([{
        "id": e.id,
        "name": e.name,
        "muscle_group": e.muscle_group,
        "description": e.description
    } for e in exercises]), 200

@exercises_bp.route('', methods=['POST'])
@jwt_required()
def add_exercise():
    data = request.get_json()
    exercise = Exercise(
        name=data['name'],
        muscle_group=data.get('muscle_group'),
        description=data.get('description')
    )
    db.session.add(exercise)
    db.session.commit()
    return jsonify({"msg": "Ejercicio añadido", "id": exercise.id}), 201
