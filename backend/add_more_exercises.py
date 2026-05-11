"""
Añade ejercicios adicionales a la BD (sin borrar los existentes).
Ejecutar: docker exec gymtrackpro-backend-1 python add_more_exercises.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app import create_app, db
from app.models import Exercise

NEW_EXERCISES = [
    # ── PECHO ──
    ("Flexiones Diamante",       "Pecho", "Manos en posición de diamante bajo el pecho. Trabaja el pecho interno y tríceps."),
    ("Pullover con Mancuerna",   "Pecho", "Tumbado en banco, baja la mancuerna en arco por encima de la cabeza."),
    ("Press de Banca Declinado", "Pecho", "Banco inclinado hacia abajo. Enfatiza la parte inferior del pectoral."),
    ("Cable Crossover Bajo",     "Pecho", "Poleas bajas. Junta las manos hacia arriba para activar el pecho superior."),
    ("Flexiones con Lastre",     "Pecho", "Flexiones estándar con mochila o disco encima para añadir resistencia."),

    # ── ESPALDA ──
    ("Remo al Mentón",           "Espalda", "Barra o mancuernas. Sube hasta la barbilla activando trapecios y dorsales."),
    ("Pulldown de Brazo Recto",  "Espalda", "Cable alto. Brazos casi rectos, empuja hacia abajo hasta los muslos."),
    ("Encogimientos de Hombros", "Espalda", "Barra o mancuernas. Eleva los hombros hacia las orejas. Trabaja trapecios."),
    ("Remo Invertido en Barra",  "Espalda", "Debajo de una barra fija, tira del pecho hacia la barra. Peso corporal."),
    ("Buenos Días",              "Espalda", "Barra en la espalda, inclina el torso hacia adelante. Trabaja la cadena posterior."),

    # ── HOMBROS ──
    ("Elevaciones en W",         "Hombros", "Cable o mancuernas. Eleva los brazos en forma de W activando el deltoides posterior."),
    ("Rotación Externa en Cable","Hombros", "Cable bajo. Trabaja los rotadores externos del hombro, clave para salud articular."),
    ("Press Landmine",           "Hombros", "Barra anclada al suelo. Press unilateral que reduce estrés en el hombro."),
    ("Elevaciones Laterales Sentado","Hombros", "Sentado en banco, sin impulso. Mayor aislamiento del deltoides lateral."),
    ("Face Pull con Cuerda",     "Hombros", "Cable a la cara con cuerda. Trabaja deltoides posterior y rotadores externos."),

    # ── BÍCEPS ──
    ("Curl Predicador",          "Bíceps", "Banco predicador. Elimina el balanceo para máximo aislamiento del bíceps."),
    ("Curl Araña",               "Bíceps", "Tumbado boca abajo en banco inclinado. Mayor estiramiento del bíceps."),
    ("Curl 21s",                 "Bíceps", "21 repeticiones divididas en 3 rangos de movimiento. Alta congestión."),
    ("Curl Alterno con Supinación","Bíceps", "Gira la mano al subir para máxima contracción del bíceps braquial."),
    ("Curl en Polea Alta",       "Bíceps", "Cable alto. Simula la pose de bíceps para tensión máxima en la cima."),

    # ── TRÍCEPS ──
    ("Skull Crusher con Mancuernas","Tríceps", "Tumbado, baja las mancuernas a los lados de la cabeza. Gran estiramiento."),
    ("Extensión Sobre la Cabeza","Tríceps", "Con mancuerna o cable, extiende los brazos por encima de la cabeza."),
    ("Dips en Paralelas Cerrado","Tríceps", "Torso erguido y codos pegados al cuerpo para enfatizar el tríceps."),
    ("Patada de Tríceps en Cable","Tríceps", "Cable bajo, inclina el torso y extiende el brazo hacia atrás."),
    ("Press Nórdico Inverso",    "Tríceps", "Con los pies fijos, baja el torso controlando la extensión del codo."),

    # ── PIERNAS ──
    ("Sentadilla Búlgara",       "Piernas", "Pie trasero en banco. Gran activación de cuádriceps y glúteos unilateral."),
    ("Peso Muerto Convencional", "Piernas", "Ejercicio rey de fuerza. Trabaja isquios, glúteos y toda la espalda."),
    ("Step Up con Mancuernas",   "Piernas", "Sube a un cajón alternando piernas. Excelente para equilibrio y fuerza."),
    ("Sentadilla Hack",          "Piernas", "Máquina o barra detrás. Énfasis en la parte inferior del cuádriceps."),
    ("Bicicleta Estática HIIT",  "Piernas", "Intervalos de alta intensidad en bici. Trabaja piernas y cardiovascular."),

    # ── GLÚTEOS ──
    ("Abducción de Cadera",      "Glúteos", "Máquina o cable. Separa las piernas hacia afuera activando glúteo medio."),
    ("Peso Muerto a Una Pierna", "Glúteos", "Unilateral con mancuerna. Gran trabajo de glúteo y equilibrio."),
    ("Marcha de Glúteo con Banda","Glúteos", "Banda elástica en rodillas. Pasos laterales activando glúteo medio."),
    ("Sentadilla Goblet",        "Glúteos", "Con una mancuerna o kettlebell al pecho. Perfecto para profundidad."),
    ("Empuje de Cadera con Pie Elevado","Glúteos", "Pie en banco, mayor rango de movimiento para el glúteo."),

    # ── ABDOMINALES ──
    ("Cable Crunch",             "Abdominales", "Arrodillado ante la polea. Tira hacia abajo contrayendo el core."),
    ("Tijeras",                  "Abdominales", "Tumbado, alterna las piernas arriba y abajo sin tocar el suelo."),
    ("Rollout con Rueda",        "Abdominales", "Extiende los brazos rodando hacia adelante. Exige estabilidad total del core."),
    ("Plancha Lateral",          "Abdominales", "Apoyado en un antebrazo. Trabaja oblicuos y estabilizadores del core."),
    ("Dead Bug",                 "Abdominales", "Espalda en suelo. Extiende brazo y pierna opuestos sin perder el core."),

    # ── GEMELOS ──
    ("Elevación de Talones con Peso","Gemelos", "Con mancuernas o barra. Máxima carga en los gemelos de pie."),
    ("Elevación de Talones en Step","Gemelos", "Sobre un escalón para mayor rango de movimiento."),
    ("Skipping Alto",            "Gemelos", "Carrera en el sitio levantando las rodillas al máximo. Activa gemelos y cardio."),
    ("Saltos de Pliometría",     "Gemelos", "Saltos explosivos al cajón o al suelo. Potencia y gemelos."),
    ("Caminar de Talones",       "Gemelos", "Camina sobre los talones para activar el tibial anterior y los gemelos."),

    # ── CARDIO ──
    ("Battle Ropes",             "Cardio", "Cuerdas de batalla. Ejercicio de alta intensidad que trabaja todo el cuerpo."),
    ("Jumping Jacks",            "Cardio", "Saltos con apertura de piernas y brazos. Cardio de bajo impacto."),
    ("Escaladora",               "Cardio", "Máquina escaladora. Simula subir escaleras con alta demanda cardiovascular."),
    ("Sprint en Intervalos",     "Cardio", "Alterna sprints de 20s con recuperación de 40s durante 10 minutos."),
    ("Mountain Climbers",        "Cardio", "En posición de plancha, lleva las rodillas al pecho alternativamente."),
]

def add_exercises():
    app = create_app()
    with app.app_context():
        existing_names = {ex.name for ex in Exercise.query.all()}
        to_add = [
            Exercise(name=name, muscle_group=group, description=desc)
            for name, group, desc in NEW_EXERCISES
            if name not in existing_names
        ]
        if not to_add:
            print("ℹ️  Todos los ejercicios ya existen. No se añadió nada.")
            return
        db.session.bulk_save_objects(to_add)
        db.session.commit()
        print(f"✅ Añadidos {len(to_add)} ejercicios nuevos.")
        total = Exercise.query.count()
        print(f"📊 Total en BD: {total} ejercicios")

if __name__ == '__main__':
    add_exercises()
