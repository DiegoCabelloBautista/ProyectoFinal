"""
Script de seed para poblar la tabla exercises con 5 ejercicios por grupo muscular.
Ejecutar dentro del contenedor: python seed_exercises.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models import Exercise

EXERCISES = [
    # ── PECHO ──────────────────────────────────────────────────────────────────
    ("Press de Banca Plano",      "Pecho", "Ejercicio compuesto de empuje. Tumbado en banco, baja la barra al pecho y empuja."),
    ("Press de Banca Inclinado",  "Pecho", "Variante inclinada que enfatiza la parte superior del pectoral."),
    ("Aperturas con Mancuernas",  "Pecho", "Ejercicio de aislamiento. Abre los brazos en arco controlando el estiramiento."),
    ("Fondos en Paralelas",       "Pecho", "Ejercicio en peso corporal. Inclina el torso hacia adelante para enfatizar el pecho."),
    ("Crossover en Polea",        "Pecho", "Ejercicio de aislamiento con cable. Junta las manos al frente cruzando el plano."),

    # ── ESPALDA ────────────────────────────────────────────────────────────────
    ("Dominadas",                 "Espalda", "Ejercicio en peso corporal. Agarre prono ancho, sube hasta que la barbilla supere la barra."),
    ("Remo con Barra",            "Espalda", "Ejercicio compuesto. Inclina el torso 45°, tira de la barra hacia el ombligo."),
    ("Jalón al Pecho",            "Espalda", "Polea alta. Tira de la barra hasta el pecho manteniendo el torso erguido."),
    ("Remo en Polea Baja",        "Espalda", "Cable sentado. Tira del asa hacia el abdomen y contrae la espalda."),
    ("Remo con Mancuerna",        "Espalda", "Un brazo a la vez apoyado en banco. Tira la mancuerna hacia la cadera."),

    # ── HOMBROS ────────────────────────────────────────────────────────────────
    ("Press Militar con Barra",   "Hombros", "Ejercicio compuesto de empuje vertical. Empuja la barra desde los hombros hacia arriba."),
    ("Elevaciones Laterales",     "Hombros", "Aislamiento del deltoides lateral. Sube los brazos hasta la altura del hombro."),
    ("Elevaciones Frontales",     "Hombros", "Aislamiento del deltoides anterior. Sube los brazos hasta 90° al frente."),
    ("Press Arnold",              "Hombros", "Variante del press con mancuernas que incluye rotación del antebrazo."),
    ("Pájaro / Face Pull",        "Hombros", "Cable a la altura de la cara. Trabaja el deltoides posterior y rotadores."),

    # ── BÍCEPS ─────────────────────────────────────────────────────────────────
    ("Curl con Barra",            "Bíceps", "Ejercicio básico de bíceps. Mantén los codos pegados al cuerpo."),
    ("Curl Martillo",             "Bíceps", "Agarre neutro. Enfatiza el braquial y braquiorradial."),
    ("Curl Concentrado",          "Bíceps", "Sentado, apoya el codo en el muslo para máximo aislamiento."),
    ("Curl en Polea Baja",        "Bíceps", "Cable. Permite tensión constante durante todo el recorrido."),
    ("Curl Inclinado",            "Bíceps", "Tumbado en banco inclinado, mayor estiramiento del bíceps en el fondo."),

    # ── TRÍCEPS ────────────────────────────────────────────────────────────────
    ("Press Francés",             "Tríceps", "Tumbado, baja la barra a la frente doblando los codos. Gran rango de movimiento."),
    ("Fondos en Banco",           "Tríceps", "Peso corporal. Manos en banco, desciende doblando los codos."),
    ("Extensión en Polea Alta",   "Tríceps", "Cable hacia abajo. Mantén los codos pegados al cuerpo."),
    ("Press Cerrado",             "Tríceps", "Barra, agarre estrecho. Compuesto que también trabaja el pecho."),
    ("Kickback con Mancuerna",    "Tríceps", "Inclinado, extiende el brazo hacia atrás hasta bloquearlo."),

    # ── PIERNAS ────────────────────────────────────────────────────────────────
    ("Sentadilla con Barra",      "Piernas", "Ejercicio compuesto rey de piernas. Baja hasta que los muslos queden paralelos al suelo."),
    ("Prensa de Piernas",         "Piernas", "Máquina. Empuja con los talones, rodillas sin bloquearse arriba."),
    ("Zancadas con Mancuernas",   "Piernas", "Da un paso adelante y baja la rodilla trasera casi al suelo."),
    ("Curl de Isquiotibiales",    "Piernas", "Máquina tumbado. Aislamiento de los isquios."),
    ("Extensión de Cuádriceps",   "Piernas", "Máquina sentado. Extiende la rodilla hasta bloquear sin impulso."),

    # ── GLÚTEOS ────────────────────────────────────────────────────────────────
    ("Hip Thrust",                "Glúteos", "Hombros en banco, barra sobre las caderas. Eleva la cadera hasta extensión completa."),
    ("Peso Muerto Rumano",        "Glúteos", "Barra o mancuernas. Desciende manteniendo la espada recta y sintiendo el estiramiento."),
    ("Sentadilla Sumo",           "Glúteos", "Stance ancho, puntas hacia afuera, mayor activación de glúteos y aductores."),
    ("Patada de Glúteo en Cable", "Glúteos", "Cable al tobillo, extiende la cadera hacia atrás con control."),
    ("Puente de Glúteo",          "Glúteos", "Tumbado boca arriba, eleva la cadera apoyando pies en suelo. Con o sin peso."),

    # ── ABDOMINALES ────────────────────────────────────────────────────────────
    ("Crunch Abdominal",          "Abdominales", "Contrae el abdomen llevando los hombros hacia las rodillas. No jales del cuello."),
    ("Plancha",                   "Abdominales", "Posición de flexión sobre antebrazos. Mantén el cuerpo recto el mayor tiempo posible."),
    ("Elevación de Piernas",      "Abdominales", "Colgado de barra o tumbado. Sube las piernas rectas hasta 90°."),
    ("Russian Twist",             "Abdominales", "Sentado, pies levantados. Rota el torso de lado a lado con o sin peso."),
    ("Rueda Abdominal",           "Abdominales", "Rodilla en suelo o de pie. Extiende los brazos y vuelve con control total."),

    # ── GEMELOS ────────────────────────────────────────────────────────────────
    ("Elevación de Talones de Pie",  "Gemelos", "En máquina o libre. Sube sobre las puntas de los pies y baja lentamente."),
    ("Elevación de Talones Sentado", "Gemelos", "Máquina sentado. Enfatiza el sóleo. Rodillas a 90°."),
    ("Elevación en Prensa",          "Gemelos", "Con los pies en la prensa, empuja con la punta. Excelente carga."),
    ("Saltos a la Comba",            "Gemelos", "Cardio y potencia de gemelos. Mantén las rodillas ligeramente flexionadas."),
    ("Caminata sobre Puntas",        "Gemelos", "Camina 20-30 metros sobre las puntas de los pies para activación continua."),

    # ── CARDIO ─────────────────────────────────────────────────────────────────
    ("Carrera en Cinta",          "Cardio", "Cardio aeróbico. Ajusta la velocidad e inclinación según el objetivo."),
    ("Bicicleta Estática",        "Cardio", "Bajo impacto en articulaciones. Ideal para calentamiento o LISS."),
    ("Remo Ergómetro",            "Cardio", "Ejercicio de cuerpo completo con énfasis en espalda y piernas."),
    ("Burpees",                   "Cardio", "Ejercicio de alta intensidad: sentadilla, plancha, flexión y salto."),
    ("Salto a la Cuerda",         "Cardio", "Coordinación y cardio. Alterna ritmo lento e intenso por intervalos."),
]


def seed():
    app = create_app()
    with app.app_context():
        existing = Exercise.query.count()
        if existing > 0:
            print(f"ℹ️  Ya existen {existing} ejercicios. Limpiando para re-sembrar...")
            Exercise.query.delete()
            db.session.commit()

        exercises = [
            Exercise(name=name, muscle_group=group, description=desc)
            for name, group, desc in EXERCISES
        ]
        db.session.bulk_save_objects(exercises)
        db.session.commit()

        total = Exercise.query.count()
        print(f"✅ Seed completado: {total} ejercicios insertados.")

        groups = db.session.query(Exercise.muscle_group, db.func.count(Exercise.id))\
            .group_by(Exercise.muscle_group).all()
        print("\nDesglose por grupo muscular:")
        for g, count in sorted(groups):
            print(f"  {g:<20} → {count} ejercicios")


if __name__ == '__main__':
    seed()
