import sys
import os

# Añadir el directorio raíz al path para poder importar la app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app import create_app, db
from backend.app.models import Exercise
from sqlalchemy import text

def repair():
    app = create_app()
    with app.app_context():
        print("Iniciando reparación de tildes...")
        
        # Diccionario de correcciones comunes
        correcciones = {
            "Jal??n": "Jalón",
            "Tr??ceps": "Tríceps",
            "B??ceps": "Bíceps",
            "Pr??s": "Press",
            "Pech??n": "Pechón", # Por si acaso
            "Elevaci??n": "Elevación",
            "Extensi??n": "Extensión",
            "Flexi??n": "Flexión",
            "Abdomi??n": "Abdomen",
            "Gimn??stico": "Gimnástico",
            "Pector??l": "Pectoral"
        }
        
        exercises = Exercise.query.all()
        reparados = 0
        
        for ex in exercises:
            original_name = ex.name
            new_name = original_name
            
            for roto, correcto in correcciones.items():
                if roto in new_name:
                    new_name = new_name.replace(roto, correcto)
            
            # Limpieza genérica de ?? si queda alguno
            if "??" in new_name:
                # Si no sabemos qué es, al menos quitamos los ??
                print(f"Aviso: No se pudo identificar la tilde en '{new_name}'")
            
            if new_name != original_name:
                print(f"Reparando: {original_name} -> {new_name}")
                ex.name = new_name
                reparados += 1
        
        db.session.commit()
        print(f"¡Reparación finalizada! Se han corregido {reparados} ejercicios.")

if __name__ == "__main__":
    repair()
