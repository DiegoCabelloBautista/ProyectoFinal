from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from ..models import User, db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validar que se recibieron datos
        if not data:
            return jsonify({"msg": "No se recibieron datos"}), 400
        
        # Validar campos requeridos
        required_fields = ['username', 'email', 'password']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"msg": f"El campo '{field}' es requerido"}), 400
        
        # Validar que el username no exista
        if User.query.filter_by(username=data['username']).first():
            return jsonify({"msg": "El nombre de usuario ya existe"}), 400
        
        # Validar que el email no exista
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"msg": "El correo electrónico ya existe"}), 400
        
        # Crear el usuario
        user = User(username=data['username'], email=data['email'])
        user.set_password(data['password'])
        db.session.add(user)
        db.session.commit()
        
        return jsonify({"msg": "Usuario creado correctamente"}), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error en registro: {str(e)}")  # Para debugging
        return jsonify({"msg": "Error al registrar usuario", "error": str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        user = User.query.filter_by(username=data['username']).first()
        if user and user.check_password(data['password']):
            access_token = create_access_token(identity=str(user.id))
            return jsonify(access_token=access_token, user={"id": user.id, "username": user.username}), 200
        return jsonify({"msg": "Usuario o contraseña incorrectos"}), 401
    except Exception as e:
        print(f"ERROR en login: {str(e)}")
        import traceback
        with open("error_log.txt", "a") as f:
            f.write(f"ERROR en login: {str(e)}\n")
            traceback.print_exc(file=f)
        return jsonify({"msg": "Error al iniciar sesión", "error": str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({"msg": "Usuario no encontrado"}), 404
        
        return jsonify({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "level": user.level if user.level is not None else 1,
            "xp": user.xp if user.xp is not None else 0,
            "coins": user.coins if user.coins is not None else 0,
            "xp_progress": round(user.xp_progress_percentage(), 2),
            "avatar_icon": user.avatar_icon,
            "username_color": user.username_color,
            "is_verified": user.is_verified,
            "title": user.title,
            "current_streak": user.current_streak or 0,
            "longest_streak": user.longest_streak or 0,
            "last_workout_date": user.last_workout_date.isoformat() if user.last_workout_date else None,
        }), 200
    except Exception as e:
        print(f"ERROR en me: {str(e)}")
        import traceback
        with open("error_log.txt", "a") as f:
            f.write(f"ERROR en me: {str(e)}\n")
            traceback.print_exc(file=f)
        return jsonify({"msg": "Error al obtener datos de usuario", "error": str(e)}), 500

