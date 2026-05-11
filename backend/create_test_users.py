from app import create_app, db
from app.models import User

def create_users():
    app = create_app()
    with app.app_context():
        # Crear Admin
        if not User.query.filter_by(username='admin_gtp').first():
            admin = User(username='admin_gtp', email='admin@gymtrackpro.com', role='admin')
            admin.set_password('admin123')
            admin.is_verified = True
            db.session.add(admin)
            print("Admin 'admin_gtp' creado con éxito. Pass: admin123")
        else:
            print("El usuario admin ya existe.")

        # Crear Entrenador
        if not User.query.filter_by(username='trainer_gtp').first():
            trainer = User(username='trainer_gtp', email='trainer@gymtrackpro.com', role='trainer')
            trainer.set_password('trainer123')
            trainer.is_verified = True
            db.session.add(trainer)
            print("Trainer 'trainer_gtp' creado con éxito. Pass: trainer123")
        else:
            print("El usuario trainer ya existe.")

        db.session.commit()

if __name__ == '__main__':
    create_users()
