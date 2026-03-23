from app import create_app, db

def upgrade():
    app = create_app()
    with app.app_context():
        # Crear tabla body_metrics en MariaDB directamente o usando db.create_all()
        # Dado que body_metrics es nuevo, podemos usar create_all
        db.create_all()
        print("✅ Las nuevas tablas (body_metrics) han sido creadas exitosamente.")

if __name__ == '__main__':
    upgrade()
