import os
from flask import Flask
from flask_login import LoginManager
from dotenv import load_dotenv
from .models import db, User
from flask_cors import CORS
from redis import Redis
from rq import Queue
from b2sdk.v2 import B2Api, InMemoryAccountInfo

# --- Initialize Extensions (but don't connect them to the app yet) ---
login_manager = LoginManager()
cors = CORS()

# --- Global B2 and RQ instances ---
# These are initialized once and can be imported by other parts of the app
redis_url = os.environ.get('REDIS_URL', 'redis://localhost:6379')
redis_conn = Redis.from_url(redis_url)
q = Queue(connection=redis_conn)

info = InMemoryAccountInfo()
b2_api = B2Api(info)
key_id = os.environ.get('B2_KEY_ID')
application_key = os.environ.get('B2_APPLICATION_KEY')
bucket_id = os.environ.get('B2_BUCKET_ID')

# --- App Factory Function ---
def create_app():
    load_dotenv()
    
    app = Flask(__name__)
    
    # --- Configuration ---
    app.secret_key = os.environ.get('SECRET_KEY', 'a-very-secret-key')
    app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024 # 100MB
    
    db_url = os.environ.get('DATABASE_URL', 'sqlite:///project.db')
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    app.config["SQLALCHEMY_DATABASE_URI"] = db_url
    
    # --- Initialize Extensions with the App ---
    db.init_app(app)
    cors.init_app(app)
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(User, int(user_id))

    # --- Authorize B2 API ---
    b2_api.authorize_account("production", key_id, application_key)

    # --- Import and Register Blueprints (Routes) ---
    from .auth import auth_bp
    from .main_routes import main_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(main_bp, url_prefix='/api')

    # Create database tables if they don't exist
    with app.app_context():
        db.create_all()

    return app
