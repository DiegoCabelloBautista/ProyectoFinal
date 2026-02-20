from app import create_app, db
from app.models import User, Achievement, UserAchievement
import sys

app = create_app()
with app.app_context():
    try:
        print("Probando consulta de Achievements...")
        achievements = Achievement.query.all()
        print(f"Logros encontrados: {len(achievements)}")
        
        print("Probando consulta de Users...")
        users = User.query.all()
        print(f"Usuarios encontrados: {len(users)}")
        
        if users:
            user = users[0]
            print(f"Probando UserAchievement para usuario {user.id}...")
            user_achievements = UserAchievement.query.filter_by(user_id=user.id).all()
            print(f"Logros de usuario: {len(user_achievements)}")
            
            print("Probando cálculo de nivel...")
            print(f"Nivel: {user.level}, XP: {user.xp}")
            print(f"Progreso: {user.xp_progress_percentage()}%")
            
        print("✅ Todo parece correcto a nivel de modelos.")
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
