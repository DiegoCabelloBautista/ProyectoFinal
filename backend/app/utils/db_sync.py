from sqlalchemy import text
from ..models import db

def sync_database_schema(app):
    """
    Intenta sincronizar el esquema de la base de datos añadiendo columnas faltantes.
    Útil para despliegues en Render/Aiven sin migraciones formales.
    """
    with app.app_context():
        print("🔍 Verificando integridad del esquema de la base de datos...")
        
        # Lista de columnas que podrían faltar según el log de errores
        potential_missing_columns = [
            ("users", "avatar_url", "VARCHAR(255) DEFAULT NULL"),
            ("users", "trainer_note", "VARCHAR(255) DEFAULT NULL"),
            ("users", "trainer_note_date", "DATETIME DEFAULT NULL"),
            ("routines", "music_url", "VARCHAR(500) DEFAULT NULL"),
            ("workout_sessions", "routine_id", "INT DEFAULT NULL"),
        ]
        
        for table, column, col_type in potential_missing_columns:
            try:
                # Comprobar si la columna existe
                result = db.session.execute(text(f"SHOW COLUMNS FROM {table} LIKE '{column}'")).fetchone()
                if not result:
                    print(f"➕ Añadiendo columna faltante '{column}' a la tabla '{table}'...")
                    db.session.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {col_type}"))
                    db.session.commit()
                    print(f"✅ Columna '{column}' añadida.")
            except Exception as e:
                db.session.rollback()
                print(f"⚠️ No se pudo verificar/añadir {table}.{column}: {str(e)}")
        
        print("✨ Verificación de esquema completada.")
