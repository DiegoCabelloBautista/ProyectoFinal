from app import create_app, db
from sqlalchemy import text

app = create_app()
with app.app_context():
    try:
        # Intentar añadir la columna avatar_url a la tabla users
        db.session.execute(text("ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) DEFAULT NULL"))
        db.session.commit()
        print("Columna avatar_url añadida con éxito.")
    except Exception as e:
        db.session.rollback()
        print(f"Error o la columna ya existe: {str(e)}")
