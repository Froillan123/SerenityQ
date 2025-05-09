from imports import *  # Import everything from imports.py
from routes import auth_bp, user_bp, admin_bp, psychologist_bp  # Import your blueprints
from flask_migrate import Migrate
from datetime import timedelta
import os
import pymysql
import sqlalchemy
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Determine database configuration based on environment
# If DATABASE_URL is provided, use PostgreSQL config (Railway)
if os.getenv('DATABASE_URL'):
    app.config.from_object('dbconfig')  # PostgreSQL config from dbconfig.py
    print("✅ Using Railway PostgreSQL database")
else:
    # Local MySQL configuration (XAMPP) for development
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:@localhost:3306/serenityq'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    print("✅ Using local MySQL database")

# Initialize extensions
CORS(app, supports_credentials=True)
db.init_app(app)
jwt.init_app(app)
migrate = Migrate(app, db)  # Initialize Flask-Migrate

# Configure email settings
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME', 'serenityq143@gmail.com')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD', 'ofel qkqc rnnx lbkc')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME', 'serenityq143@gmail.com')

# File upload configuration
app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'static', 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

# JWT Configuration
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_COOKIE_SECURE'] = os.getenv('FLASK_ENV') == 'production'
app.config['JWT_COOKIE_CSRF_PROTECT'] = os.getenv('FLASK_ENV') == 'production'
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'fallback-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)

# Admin configuration
app.config['ADMIN_SECRET_KEY'] = os.getenv('ADMIN_SECRET_KEY', 'fallback-admin-key')

# Add no-cache headers
@app.after_request
def add_no_cache_headers(response):
    """Add headers to prevent caching for all responses"""
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '-1'
    return response

# Routes
@app.route('/')
def root_landing_page():
    return render_template('landing/landingpage.html')


# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/auth') 
app.register_blueprint(user_bp, url_prefix='/user') 
app.register_blueprint(admin_bp, url_prefix='/admin')  
app.register_blueprint(psychologist_bp, url_prefix='/psychologist') 

def create_database_if_not_exists():
    """Create the database if it doesn't exist (for local development only)"""
    try:
        # Skip for Railway PostgreSQL - database already exists
        if os.getenv('DATABASE_URL'):
            print("✅ Using existing Railway database")
            return
        
        # For development with MySQL (XAMPP)
        db_name = app.config['SQLALCHEMY_DATABASE_URI'].split('/')[-1]
        
        # Connect to MySQL without specifying a database
        connection = pymysql.connect(
            host='localhost',
            user='root',
            password='',
            charset='utf8mb4'
        )
        
        with connection.cursor() as cursor:
            # Create database if it doesn't exist
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
            print(f"✅ Database '{db_name}' created or already exists")
        
        connection.close()
            
    except Exception as e:
        print(f"❌ Database creation error: {str(e)}")
        
def sync_database_tables():
    """Ensure tables exist in the database (works for both Railway and local)"""
    try:
        # Connect to the database
        db.engine.connect()
        print("✅ Connected to database successfully")
        
        # Create tables that don't exist yet (like Sequelize sync)
        print("📊 Synchronizing database tables...")
        db.create_all()
        print("✅ Database tables synchronized")
                
    except Exception as e:
        print(f"❌ Database synchronization error: {str(e)}")

# Initialize database when the app starts
with app.app_context():
    # Create database if needed (local development only)
    create_database_if_not_exists()
    
    # Ensure all tables exist (for both local and Railway)
    sync_database_tables()
    
if __name__ == '__main__':
    # When running directly, we've already initialized the database
    app.run(debug=True)