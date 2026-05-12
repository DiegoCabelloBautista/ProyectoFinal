from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import User, db
from datetime import datetime

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/fix-tildes', methods=['GET'])
def fix_tildes_admin():
    try:
        from ..models import Exercise, Routine, Achievement, ShopItem, db
        # Lista exhaustiva de patrones detectados en las capturas
        correcciones = {
            "d??a": "día",
            "p??blica": "pública",
            "Energ??a": "Energía",
            "m??s": "más",
            "pr??ximas": "próximas",
            "Jal??n": "Jalón",
            "Tr??ceps": "Tríceps",
            "B??ceps": "Bíceps",
            "Pr??s": "Press",
            "Elevaci??n": "Elevación",
            "Extensi??n": "Extensión",
            "Flexi??n": "Flexión",
            "Gimn??stico": "Gimnástico",
            "Cintur??n": "Cinturón",
            "??": "ó" # Fallback para casos genéricos
        }
        
        models_to_fix = [
            (Exercise, ['name', 'description']),
            (Achievement, ['name', 'description']),
            (ShopItem, ['name', 'description']),
            (Routine, ['name', 'description'])
        ]
        
        count = 0
        for model, fields in models_to_fix:
            items = model.query.all()
            for item in items:
                cambiado = False
                for field in fields:
                    val = getattr(item, field)
                    if val:
                        new_val = val
                        for r, f in correcciones.items():
                            new_val = new_val.replace(r, f)
                        if new_val != val:
                            setattr(item, field, new_val)
                            cambiado = True
                if cambiado:
                    count += 1
        
        db.session.commit()
        return jsonify({
            "msg": f"Reparación completada. Se han corregido {count} elementos.",
            "status": "success"
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

def is_admin(user_id):
    user = User.query.get(user_id)
    return user and user.role == 'admin'

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    try:
        current_user_id = get_jwt_identity()
        if not is_admin(current_user_id):
            return jsonify({"msg": "No autorizado"}), 403
            
        users = User.query.all()
        return jsonify([{
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "role": u.role,
            "created_at": u.created_at.isoformat() if u.created_at else None
        } for u in users]), 200
    except Exception as e:
        return jsonify({"msg": "Error al obtener usuarios", "error": str(e)}), 500

@admin_bp.route('/users/<int:user_id>/role', methods=['PUT'])
@jwt_required()
def update_user_role(user_id):
    try:
        current_user_id = get_jwt_identity()
        if not is_admin(current_user_id):
            return jsonify({"msg": "No autorizado"}), 403
            
        data = request.get_json()
        new_role = data.get('role')
        
        if new_role not in ['admin', 'trainer', 'user']:
            return jsonify({"msg": "Rol inválido"}), 400
            
        user = User.query.get(user_id)
        if not user:
            return jsonify({"msg": "Usuario no encontrado"}), 404
            
        user.role = new_role
        db.session.commit()
        
        return jsonify({"msg": f"Rol actualizado a {new_role}"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al actualizar rol", "error": str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    try:
        current_user_id = get_jwt_identity()
        if not is_admin(current_user_id):
            return jsonify({"msg": "No autorizado"}), 403
            
        if current_user_id == user_id:
            return jsonify({"msg": "No puedes borrar tu propia cuenta"}), 400
            
        user = User.query.get(user_id)
        if not user:
            return jsonify({"msg": "Usuario no encontrado"}), 404
            
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({"msg": "Usuario eliminado correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al eliminar usuario", "error": str(e)}), 500

@admin_bp.route('/coach-clients', methods=['GET'])
@jwt_required()
def get_coach_clients():
    """Permite a entrenadores ver un resumen de todos los usuarios (clientes)."""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if user.role not in ['admin', 'trainer']:
            return jsonify({"msg": "No autorizado"}), 403
            
        users = User.query.all()
        return jsonify([{
            "id": u.id,
            "username": u.username,
            "level": u.level,
            "last_workout": u.last_workout_date.isoformat() if u.last_workout_date else None,
            "avatar_icon": u.avatar_icon,
            "username_color": u.username_color
        } for u in users]), 200
    except Exception as e:
        return jsonify({"msg": "Error al obtener clientes", "error": str(e)}), 500

@admin_bp.route('/coach/client/<int:client_id>/stats', methods=['GET'])
@jwt_required()
def get_client_stats(client_id):
    """Permite a entrenadores ver las estadísticas detalladas de un cliente."""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if user.role not in ['admin', 'trainer']:
            return jsonify({"msg": "No autorizado"}), 403
            
        client = User.query.get(client_id)
        if not client:
            return jsonify({"msg": "Cliente no encontrado"}), 404
            
        from ..models import WorkoutSession, WorkoutLog, Exercise
        from sqlalchemy import func
        
        total_sessions = WorkoutSession.query.filter_by(user_id=client_id).count()
        
        # Volumen total
        total_volume = db.session.query(func.sum(WorkoutLog.weight * WorkoutLog.reps))\
            .join(WorkoutSession)\
            .filter(WorkoutSession.user_id == client_id).scalar() or 0
            
        # Mejores levantamientos (PRs)
        # Necesitamos unir con Exercise para obtener el nombre
        best_lifts = db.session.query(Exercise.name, func.max(WorkoutLog.weight))\
            .join(WorkoutLog, WorkoutLog.exercise_id == Exercise.id)\
            .join(WorkoutSession, WorkoutSession.id == WorkoutLog.session_id)\
            .filter(WorkoutSession.user_id == client_id)\
            .group_by(Exercise.name)\
            .order_by(func.max(WorkoutLog.weight).desc())\
            .limit(5).all()

        return jsonify({
            "username": client.username,
            "level": client.level,
            "total_sessions": total_sessions,
            "total_volume": float(total_volume),
            "best_lifts": [{"exercise": b[0], "weight": float(b[1])} for b in best_lifts],
            "streak": client.current_streak
        }), 200
    except Exception as e:
        print(f"Error en get_client_stats: {str(e)}")
        return jsonify({"msg": "Error al obtener estadísticas del cliente", "error": str(e)}), 500

@admin_bp.route('/coach/client/<int:client_id>/nudge', methods=['POST'])
@jwt_required()
def nudge_user(client_id):
    """Permite a un entrenador enviar un 'toque' o mensaje de advertencia a un atleta."""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if user.role not in ['admin', 'trainer']:
            return jsonify({"msg": "No autorizado"}), 403
            
        data = request.get_json()
        note = data.get('note', '¡Tu entrenador te ha enviado un toque! Mantén la constancia.')
        
        client = User.query.get(client_id)
        if not client:
            return jsonify({"msg": "Cliente no encontrado"}), 404
            
        client.trainer_note = note
        client.trainer_note_date = datetime.utcnow()
        db.session.commit()
        
        return jsonify({"msg": "Advertencia enviada correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al enviar advertencia", "error": str(e)}), 500

@admin_bp.route('/coach/client/<int:client_id>/reward', methods=['POST'])
@jwt_required()
def reward_user(client_id):
    """Permite a un entrenador premiar a un atleta con monedas."""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if user.role not in ['admin', 'trainer']:
            return jsonify({"msg": "No autorizado"}), 403
            
        data = request.get_json()
        amount = data.get('amount', 50)
        
        client = User.query.get(client_id)
        if not client:
            return jsonify({"msg": "Cliente no encontrado"}), 404
            
        client.coins = (client.coins or 0) + amount
        db.session.commit()
        
        return jsonify({"msg": f"Se han enviado {amount} monedas de recompensa"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al premiar al usuario", "error": str(e)}), 500

@admin_bp.route('/coach/client/<int:client_id>/assign-routine', methods=['POST'])
@jwt_required()
def assign_routine(client_id):
    """Permite a un entrenador asignar una rutina a un atleta."""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if user.role not in ['admin', 'trainer']:
            return jsonify({"msg": "No autorizado"}), 403
            
        data = request.get_json()
        routine_id = data.get('routine_id')
        
        if not routine_id:
            return jsonify({"msg": "ID de rutina requerido"}), 400
            
        # Buscar cliente y rutina
        from ..models import Routine
        client = User.query.get(client_id)
        routine = Routine.query.get(routine_id)
        
        if not client or not routine:
            return jsonify({"msg": "Cliente o rutina no encontrada"}), 404
            
        # 1. Enviar nota al usuario
        client.trainer_note = f"TE HE ASIGNADO UNA NUEVA RUTINA: '{routine.name}'. ¡A darle caña!"
        client.trainer_note_date = datetime.utcnow()
        
        # 2. Guardar la rutina en la biblioteca del usuario
        from ..models import SavedRoutine
        # Verificar si ya la tiene
        existing_save = SavedRoutine.query.filter_by(user_id=client_id, original_routine_id=routine_id).first()
        if not existing_save:
            new_save = SavedRoutine(
                user_id=client_id,
                original_routine_id=routine_id,
                is_assigned=True
            )
            db.session.add(new_save)
        else:
            existing_save.is_assigned = True # Marcar como asignada aunque ya la tuviera
            
        db.session.commit()
        
        return jsonify({"msg": "Rutina asignada correctamente y añadida a la biblioteca del atleta"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al asignar rutina", "error": str(e)}), 500

@admin_bp.route('/coach/clear-nudge', methods=['POST'])
@jwt_required()
def clear_nudge():
    """Permite al usuario borrar el mensaje del entrenador."""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        user.trainer_note = None
        user.trainer_note_date = None
        db.session.commit()
        return jsonify({"msg": "Mensaje borrado"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error", "error": str(e)}), 500
