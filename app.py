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

# Check if running on Render.com
is_render = os.environ.get('RENDER') == 'true'

# Choose database configuration based on environment
if os.getenv('DATABASE_URL') or is_render:
    app.config.from_object('dbconfig')  # PostgreSQL config from dbconfig.py
    print("✅ Using PostgreSQL configuration")
else:
    # XAMPP MySQL configuration for development
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:@localhost:3306/serenityq'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    print("✅ Using MySQL configuration")

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
app.config['JWT_COOKIE_SECURE'] = os.getenv('FLASK_ENV') == 'production' or is_render
app.config['JWT_COOKIE_CSRF_PROTECT'] = os.getenv('FLASK_ENV') == 'production' or is_render
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
    """Create the database if it doesn't exist"""
    try:
        # Check if using PostgreSQL (production) or MySQL (development)
        if os.getenv('FLASK_ENV') == 'production' or os.getenv('DATABASE_URL') or is_render:
            # For PostgreSQL (likely on Railway or Render), we don't need to create the database
            # The database is already provisioned
            print("✅ Using provisioned PostgreSQL database")
            return
        
        # For development with MySQL (XAMPP)
        # Extract database name from URI
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
        
def sync_database_schema():
    """Synchronize database schema with current models (like Sequelize's sync)"""
    try:
        # Try to connect to the database
        db.engine.connect()
        print("✅ Connected to database successfully")
        
        # Check if tables need to be created
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        
        if not inspector.get_table_names():
            print("📊 No tables found. Creating database tables...")
            db.create_all()
            print("✅ Tables created successfully")
        else:
            print(f"✅ Found {len(inspector.get_table_names())} tables in database")
            
            # Like Sequelize's sync({alter: true}), check if migrations are needed
            has_migrations_dir = os.path.exists('migrations')
            
            if not has_migrations_dir:
                print("🔄 Initializing migrations...")
                os.system('flask db init')
                print("✅ Migrations initialized")
                
            # Generate migration
            print("🔄 Checking for model changes...")
            result = os.system('flask db migrate -m "Auto migration"')
            
            if result == 0:
                print("🔄 Applying migrations...")
                os.system('flask db upgrade')
                print("✅ Database schema synchronized")
            else:
                print("✅ No schema changes detected or applying migrations directly")
                # Try direct table creation if migration fails (for Render deployment)
                if is_render or os.getenv('DATABASE_URL'):
                    print("🔧 Force synchronizing database tables...")
                    db.create_all()
                    print("✅ Tables forcefully synchronized")
                
    except Exception as e:
        print(f"❌ Database synchronization error: {str(e)}")
        print("🔧 Attempting direct table creation...")
        try:
            # Last resort - try direct table creation
            db.create_all()
            print("✅ Tables created directly")
        except Exception as inner_e:
            print(f"❌ Table creation failed: {str(inner_e)}")

# Initialize database tables when the app starts
# This ensures tables are created even when running with gunicorn
with app.app_context():
    # Create database if it doesn't exist
    create_database_if_not_exists()
    
    # Synchronize database schema with models (like Sequelize sync)
    sync_database_schema()
        
if __name__ == '__main__':
    # When running directly (not with gunicorn), we've already initialized 
    # the database in the block above, so just start the server
    app.run(debug=True)