from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import User, ShopItem, UserAchievement, Achievement, UserItem, BodyMetric, db
from datetime import datetime

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('', methods=['GET'])
@jwt_required()
def get_profile():
    """Obtener información completa del perfil del usuario"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        # Sincronizar nivel si hay discrepancia por XP acumulada
        correct_level = user.calculate_level()
        if (user.level or 1) != correct_level:
            user.level = correct_level
            db.session.commit()
        
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
            'avatar_url': user.avatar_url,
            'username_color': user.username_color,
            'is_verified': user.is_verified,
            'title': user.title,
            'streak_shields': user.streak_shields or 0,
            'xp_booster_multiplier': user.xp_booster_multiplier or 1.0,
            'xp_booster_sessions': user.xp_booster_sessions or 0,
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
    if user.coins < (item.price or 0):
        return jsonify({"msg": "No tienes suficientes monedas"}), 400
    
    # Validar nivel
    if user.level < (item.required_level or 1):
        return jsonify({"msg": f"Necesitas nivel {item.required_level}"}), 400
    
    # Si no es consumible, revisar si ya lo tiene en su colección
    if item.item_type != 'consumable':
        already_owned = UserItem.query.filter_by(user_id=user.id, item_id=item.id).first()
        if already_owned:
            # Si ya lo tiene, simplemente lo equipamos gratis
            pass
        else:
            # Si es nuevo, restar monedas y añadir a colección
            user.coins -= item.price
            new_purchase = UserItem(user_id=user.id, item_id=item.id)
            db.session.add(new_purchase)
    else:
        # Si es consumible, restar monedas y aplicar directamente
        user.coins -= item.price

    # Aplicar el item/efecto según su tipo
    if item.item_type == 'avatar':
        user.avatar_icon = item.value
    elif item.item_type == 'color':
        user.username_color = item.value
    elif item.item_type == 'title':
        user.title = item.value
    elif item.item_type == 'badge':
        if item.value == 'verified':
            user.is_verified = True
    elif item.item_type == 'consumable':
        # Valor puede ser 'shield', 'multiplier_2.0_sessions_3', etc.
        if item.value == 'streak_shield':
            user.streak_shields = (user.streak_shields or 0) + 1
        elif item.value.startswith('multiplier_'):
            # Ejemplo: multiplier_2.0_sessions_3
            try:
                parts = item.value.split('_')
                multiplier = float(parts[1])
                sessions = int(parts[3])
                user.xp_booster_multiplier = multiplier
                user.xp_booster_sessions = (user.xp_booster_sessions or 0) + sessions
            except (IndexError, ValueError):
                pass
    
    db.session.commit()
    
    # Mensaje personalizado si ya lo tenía o es gratis
    is_update = item.price == 0 or (item.item_type != 'consumable' and UserItem.query.filter_by(user_id=user.id, item_id=item.id).count() > 0)
    msg = f"¡Has equipado {item.name}!" if is_update else f"¡Has comprado {item.name}!"

    return jsonify({
        "msg": msg,
        "remaining_coins": user.coins,
        "item_applied": True,
        "is_update": is_update,
        "current_streak_shields": user.streak_shields,
        "xp_booster_sessions": user.xp_booster_sessions
    }), 200

@profile_bp.route('/upload-avatar', methods=['POST'])
@jwt_required()
def upload_avatar():
    """Subir una foto personalizada para el avatar"""
    try:
        from werkzeug.utils import secure_filename
        import os
        from flask import current_app
        
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if 'file' not in request.files:
            return jsonify({"msg": "No se ha seleccionado ningún archivo"}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({"msg": "Archivo vacío"}), 400
            
        if file:
            filename = secure_filename(f"avatar_user_{user_id}_{file.filename}")
            upload_path = os.path.join(current_app.root_path, 'static/uploads', filename)
            file.save(upload_path)
            
            # Guardar la URL relativa
            user.avatar_url = f"/static/uploads/{filename}"
            db.session.commit()
            
            return jsonify({
                "msg": "Avatar actualizado correctamente",
                "avatar_url": user.avatar_url
            }), 200
            
    except Exception as e:
        print(f"ERROR en upload_avatar: {str(e)}")
        return jsonify({"msg": "Error al subir avatar", "error": str(e)}), 500

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
        return jsonify({"msg": "Error al obtener recompensas", "error": str(e)}), 500

@profile_bp.route('/body-metrics', methods=['GET'])
@jwt_required()
def get_body_metrics():
    try:
        user_id = get_jwt_identity()
        metrics = BodyMetric.query.filter_by(user_id=user_id).order_by(BodyMetric.date.asc()).all()
        return jsonify([{
            'id': m.id,
            'date': m.date.isoformat(),
            'weight': m.weight,
            'body_fat': m.body_fat,
            'arm_cm': m.arm_cm,
            'waist_cm': m.waist_cm,
            'chest_cm': m.chest_cm,
            'leg_cm': m.leg_cm
        } for m in metrics]), 200
    except Exception as e:
        return jsonify({"msg": "Error al obtener métricas", "error": str(e)}), 500

@profile_bp.route('/body-metrics', methods=['POST'])
@jwt_required()
def add_body_metric():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        date_str = data.get('date')
        if date_str:
            metric_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        else:
            metric_date = datetime.today().date()
            
        metric = BodyMetric.query.filter_by(user_id=user_id, date=metric_date).first()
        
        if not metric:
            metric = BodyMetric(user_id=user_id, date=metric_date)
            db.session.add(metric)
            
        if 'weight' in data and data['weight'] != '': metric.weight = float(data['weight'])
        if 'body_fat' in data and data['body_fat'] != '': metric.body_fat = float(data['body_fat'])
        if 'arm_cm' in data and data['arm_cm'] != '': metric.arm_cm = float(data['arm_cm'])
        if 'waist_cm' in data and data['waist_cm'] != '': metric.waist_cm = float(data['waist_cm'])
        if 'chest_cm' in data and data['chest_cm'] != '': metric.chest_cm = float(data['chest_cm'])
        if 'leg_cm' in data and data['leg_cm'] != '': metric.leg_cm = float(data['leg_cm'])
        
        db.session.commit()
        return jsonify({"msg": "Métrica guardada correctamente"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al guardar métrica", "error": str(e)}), 500
