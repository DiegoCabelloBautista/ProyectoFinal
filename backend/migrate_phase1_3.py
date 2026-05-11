import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app import create_app, db
from sqlalchemy import text

app = create_app()

with app.app_context():
    migrations = [
        ("role column", "ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user'"),
        ("routine_reviews table", """CREATE TABLE IF NOT EXISTS routine_reviews (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            routine_id INT NOT NULL,
            rating INT NOT NULL,
            comment TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE CASCADE
        )"""),
        ("music_url column", "ALTER TABLE routines ADD COLUMN music_url VARCHAR(500) DEFAULT NULL"),
    ]
    
    with db.engine.connect() as conn:
        for name, sql in migrations:
            try:
                conn.execute(text(sql))
                conn.commit()
                print(f"OK: {name}")
            except Exception as e:
                print(f"Skipped '{name}': {e}")
    
    print("\nAll migrations done!")
