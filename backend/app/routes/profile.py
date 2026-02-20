from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import User, ShopItem, UserAchievement, Achievement, db

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('', methods=['GET'])
@jwt_required()
def get_profile():
    """Obtener información completa del perfil del usuario"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        # Obtener logros desbloqueados
        achievements = db.session.query(Achievement).join(
            UserAchievement, UserAchievement.achievement_id == Achievement.id
        ).filter(
            UserAchievement.user_id == user_id
        ).all()
        
        # Calcular progreso al siguiente nivel
        xp_progress = user.xp_progress_percentage()
        xp_needed = user.xp_for_next_level()
        
        return jsonify({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'level': user.level,
            'xp': user.xp,
            'coins': user.coins,
            'xp_progress': round(xp_progress, 2),
            'xp_for_next_level': xp_needed,
            'avatar_icon': user.avatar_icon,
            'username_color': user.username_color,
            'is_verified': user.is_verified,
            'title': user.title,
            'achievements_count': len(achievements),
            'created_at': user.created_at.isoformat()
        }), 200
    except Exception as e:
        print(f"ERROR en get_profile: {str(e)}")
        import traceback
        with open("error_log.txt", "a") as f:
            f.write(f"ERROR en get_profile: {str(e)}\n")
            traceback.print_exc(file=f)
        return jsonify({"msg": "Error al obtener perfil", "error": str(e)}), 500

@profile_bp.route('', methods=['PUT'])
@jwt_required()
def update_profile():
    """Actualizar información básica del perfil"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        data = request.get_json()
        
        # Solo permitir actualizar campos básicos sin costo
        if 'email' in data:
            user.email = data['email']
        
        db.session.commit()
        return jsonify({"msg": "Perfil actualizado"}), 200
    except Exception as e:
        print(f"ERROR en update_profile: {str(e)}")
        return jsonify({"msg": "Error al actualizar perfil", "error": str(e)}), 500

@profile_bp.route('/shop', methods=['GET'])
@jwt_required()
def get_shop_items():
    """Obtener todos los items disponibles en la tienda"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        items = ShopItem.query.filter_by(is_active=True).all()
        
        items_data = []
        for item in items:
            can_buy = user.level >= item.required_level and user.coins >= item.price
            items_data.append({
                'id': item.id,
                'name': item.name,
                'description': item.description,
                'type': item.item_type,
                'value': item.value,
                'price': item.price,
                'required_level': item.required_level,
                'can_buy': can_buy,
                'locked': user.level < item.required_level
            })
        
        return jsonify(items_data), 200
    except Exception as e:
        print(f"ERROR en get_shop_items: {str(e)}")
        return jsonify({"msg": "Error al obtener tienda", "error": str(e)}), 500

@profile_bp.route('/shop/purchase/<int:item_id>', methods=['POST'])
@jwt_required()
def purchase_item(item_id):
    """Comprar un item de la tienda"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    item = ShopItem.query.get_or_404(item_id)
    
    # Validar que el usuario tenga suficientes monedas
    if user.coins < item.price:
        return jsonify({"msg": "No tienes suficientes monedas"}), 400
    
    # Validar que el usuario tenga el nivel necesario
    if user.level < item.required_level:
        return jsonify({"msg": f"Necesitas nivel {item.required_level}"}), 400
    
    # Restar monedas
    user.coins -= item.price
    
    # Aplicar el item según su tipo
    if item.item_type == 'avatar':
        user.avatar_icon = item.value
    elif item.item_type == 'color':
        user.username_color = item.value
    elif item.item_type == 'title':
        user.title = item.value
    elif item.item_type == 'badge':
        if item.value == 'verified':
            user.is_verified = True
    
    db.session.commit()
    
    return jsonify({
        "msg": f"¡Has comprado {item.name}!",
        "remaining_coins": user.coins,
        "item_applied": True
    }), 200

@profile_bp.route('/achievements', methods=['GET'])
@jwt_required()
def get_achievements():
    """Obtener todos los logros y cuáles ha desbloqueado el usuario"""
    try:
        user_id = get_jwt_identity()
        
        # Obtener todos los logros
        all_achievements = Achievement.query.all()
        
        # Obtener logros desbloqueados por el usuario
        unlocked_ids = [ua.achievement_id for ua in UserAchievement.query.filter_by(user_id=user_id).all()]
        
        achievements_data = []
        for achievement in all_achievements:
            achievements_data.append({
                'id': achievement.id,
                'name': achievement.name,
                'description': achievement.description,
                'icon': achievement.icon,
                'category': achievement.category,
                'xp_reward': achievement.xp_reward,
                'coins_reward': achievement.coins_reward,
                'unlocked': achievement.id in unlocked_ids
            })
        
        return jsonify(achievements_data), 200
    except Exception as e:
        print(f"ERROR en get_achievements: {str(e)}")
        import traceback
        with open("error_log.txt", "w") as f:
            f.write(f"ERROR en get_achievements: {str(e)}\n")
            traceback.print_exc(file=f)
        return jsonify({"msg": "Error al obtener logros", "error": str(e)}), 500

@profile_bp.route('/level-rewards', methods=['GET'])
@jwt_required()
def get_level_rewards():
    """Obtener información sobre recompensas por nivel"""
    try:
        rewards_table = [
            {"level": 5, "reward": "Badge Verificado", "type": "badge"},
            {"level": 10, "reward": "Avatar Premium", "type": "avatar"},
            {"level": 15, "reward": "Color de Nombre Dorado", "type": "color"},
            {"level": 20, "reward": "Título 'Iron Warrior'", "type": "title"},
            {"level": 25, "reward": "Avatar Épico", "type": "avatar"},
            {"level": 30, "reward": "Color Arcoiris", "type": "color"},
            {"level": 50, "reward": "Título 'Gym Legend'", "type": "title"},
        ]
        
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        for reward in rewards_table:
            reward['unlocked'] = user.level >= reward['level']
        
        return jsonify(rewards_table), 200
    except Exception as e:
        print(f"ERROR en get_level_rewards: {str(e)}")
        return jsonify({"msg": "Error al obtener recompensas", "error": str(e)}), 500
