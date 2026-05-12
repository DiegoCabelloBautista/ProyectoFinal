from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .config import Config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__, static_folder='static', static_url_path='/static')
    app.config.from_object(config_class)

    db.init_app(app)
    
    # Verificar conexión a la DB al arrancar
    with app.app_context():
        try:
            from sqlalchemy import text
            db.session.execute(text('SELECT 1'))
            app.logger.info("✅ Conexión a la base de datos establecida correctamente")
        except Exception as e:
            app.logger.error(f"❌ FALLO DE CONEXIÓN A DB: {str(e)}")

    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Asegurar que existe la carpeta de uploads
    import os
    upload_path = os.path.join(app.root_path, 'static/uploads')
    if not os.path.exists(upload_path):
        os.makedirs(upload_path, exist_ok=True)
    
    # Configuración CORS simplificada
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    from .routes.auth import auth_bp
    from .routes.exercises import exercises_bp
    from .routes.routines import routines_bp
    from .routes.workouts import workouts_bp
    from .routes.analytics import analytics_bp
    from .routes.profile import profile_bp
    from .routes.community import community_bp
    from .routes.admin import admin_bp

    @app.route('/api/ping')
    def ping():
        return jsonify({"status": "ok", "message": "pong"}), 200

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(exercises_bp, url_prefix='/api/exercises')
    app.register_blueprint(routines_bp, url_prefix='/api/routines')
    app.register_blueprint(workouts_bp, url_prefix='/api/workouts')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(profile_bp, url_prefix='/api/profile')
    app.register_blueprint(community_bp, url_prefix='/api/community')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    @app.errorhandler(Exception)
    def handle_exception(e):
        app.logger.error(f"Error de servidor: {str(e)}")
        code = 500
        if hasattr(e, 'code'):
            code = e.code
        return jsonify({"msg": "Error de solicitud", "error": str(e)}), code

    return app
