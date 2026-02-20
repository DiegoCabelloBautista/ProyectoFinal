from app import create_app, db
from app.models import User, Exercise

app = create_app()

@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'User': User, 'Exercise': Exercise}

if __name__ == '__main__':
    import time
    from sqlalchemy.exc import OperationalError

    retries = 5
    while retries > 0:
        try:
            with app.app_context():
                print("Intentando conectar a DB y crear tablas...")
                db.create_all()
                print("Tablas creadas/verificadas. Conexión EXITOSA.")
            break
        except OperationalError as e:
            retries -= 1
            print(f"DB no lista. Reintentando en 5s... ({retries} intentos restantes)")
            time.sleep(5)
        except Exception as e:
            print(f"FATAL ERROR en run.py: {e}")
            import traceback
            traceback.print_exc()
            break
    
    if retries == 0:
        print("ADVERTENCIA: No se pudo conectar a la base de datos tras varios intentos.")
        print("Iniciando servidor Flask de todos modos (las peticiones podrían fallar)...")
    else:
        print("Iniciando servidor Flask...")
    
    # Iniciar siempre para que el contenedor no muera
    print("Rutas registradas:")
    print(app.url_map)
    app.run(host='0.0.0.0', port=5000, debug=False)
