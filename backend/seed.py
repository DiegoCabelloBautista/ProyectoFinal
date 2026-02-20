from app import create_app, db
from app.models import Exercise

app = create_app()

def seed_exercises():
    exercises = [
        {"name": "Sentadilla", "muscle_group": "Piernas", "description": "Sentadilla trasera con barra"},
        {"name": "Press de Banca", "muscle_group": "Pecho", "description": "Press de banca plano con barra"},
        {"name": "Peso Muerto", "muscle_group": "Espalda/Piernas", "description": "Peso muerto convencional con barra"},
        {"name": "Press Militar", "muscle_group": "Hombros", "description": "Press militar de pie con barra"},
        {"name": "Dominadas", "muscle_group": "Espalda", "description": "Dominadas con peso corporal o lastradas"},
        {"name": "Remo con Barra", "muscle_group": "Espalda", "description": "Remo con barra inclinado"},
        {"name": "Prensa de Piernas", "muscle_group": "Piernas", "description": "Prensa de piernas en máquina"},
        {"name": "Press de Banca Inclinado", "muscle_group": "Pecho", "description": "Press de banca inclinado con barra"}
    ]

    with app.app_context():
        # Check if already seeded
        if Exercise.query.first():
            print("Exercises already seeded.")
            return

        for ex_data in exercises:
            ex = Exercise(**ex_data)
            db.session.add(ex)
        
        try:
            db.session.commit()
            print("Exercises seeded successfully!")
        except Exception as e:
            db.session.rollback()
            print(f"Error seeding: {e}")

if __name__ == "__main__":
    seed_exercises()
