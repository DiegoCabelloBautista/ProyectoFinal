from ..models import db, User, Achievement, UserAchievement, WorkoutSession, Routine, RoutineLike, RoutineReview, SavedRoutine, followers

def check_user_achievements(user_id):
    """
    Comprueba si el usuario ha cumplido los requisitos para nuevos logros.
    Devuelve una lista de los logros recién desbloqueados.
    """
    user = User.query.get(user_id)
    if not user:
        return []

    # Obtener logros que el usuario aún no tiene
    unlocked_ids = [ua.achievement_id for ua in user.achievements]
    pending_achievements = Achievement.query.filter(~Achievement.id.in_(unlocked_ids)).all()
    
    newly_unlocked = []

    # Valores actuales para comparar
    stats = {
        'sessions': user.sessions.count(),
        'streak': user.longest_streak or 0,
        'level': user.level or 1,
        'social_creates': user.routines.count(),
        'social_follows': user.followed.count(),
        'social_reviews': RoutineReview.query.filter_by(user_id=user_id).count(),
        'social_saves': SavedRoutine.query.filter_by(user_id=user_id).count(),
        'social_likes': db.session.query(db.func.count(RoutineLike.id)).join(Routine).filter(Routine.user_id == user_id).scalar() or 0
    }

    for ach in pending_achievements:
        val = stats.get(ach.category)
        if val is not None and val >= ach.requirement_value:
            # ¡Logro desbloqueado!
            ua = UserAchievement(user_id=user_id, achievement_id=ach.id)
            db.session.add(ua)
            
            # Dar recompensas
            user.xp += (ach.xp_reward or 0)
            user.coins += (ach.coins_reward or 0)
            
            newly_unlocked.append({
                'id': ach.id,
                'name': ach.name,
                'description': ach.description,
                'icon': ach.icon,
                'xp_reward': ach.xp_reward,
                'coins_reward': ach.coins_reward
            })

    if newly_unlocked:
        db.session.commit()

    return newly_unlocked
