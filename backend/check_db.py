from app import create_app, db
from app.models import Exercise

app = create_app()
with app.app_context():
    count = Exercise.query.count()
    print(f"Total exercises: {count}")
    if count > 0:
        ex = Exercise.query.first()
        print(f"First exercise: {ex.name} (ID: {ex.id})")
