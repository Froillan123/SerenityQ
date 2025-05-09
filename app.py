from imports import *  # Import everything from imports.py
from routes import auth_bp, user_bp, admin_bp, psychologist_bp  # Import your blueprints
from flask_migrate import Migrate
from datetime import timedelta
import os
import pymysql
import sqlalchemy

# Initialize Flask app
app = Flask(__name__)

# Choose database configuration based on environment
if os.getenv('FLASK_ENV') == 'production':
    app.config.from_object('dbconfig')  # PostgreSQL for production
else:
    # XAMPP MySQL configuration for development
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:@localhost:3306/serenityq'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


# Initialize extensions
CORS(app, supports_credentials=True)
db.init_app(app)
jwt.init_app(app)
migrate = Migrate(app, db)  # Initialize Flask-Migrate

# Configure email settings
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'serenityq143@gmail.com'
app.config['MAIL_PASSWORD'] = 'ofel qkqc rnnx lbkc'
app.config['MAIL_DEFAULT_SENDER'] = 'serenityq143@gmail.com'

# File upload configuration
app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'static', 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

# JWT Configuration
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
app.config['JWT_COOKIE_CSRF_PROTECT'] = False  # Enable in production
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
        # For development with MySQL (XAMPP)
        if os.getenv('FLASK_ENV') != 'production':
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
        else:
            # For production with PostgreSQL
            db_uri = app.config['SQLALCHEMY_DATABASE_URI']
            db_name = db_uri.split('/')[-1]
            engine = sqlalchemy.create_engine(db_uri.rsplit('/', 1)[0] + '/postgres')
            conn = engine.connect()
            conn.execute("COMMIT")
            
            # Check if database exists
            result = conn.execute(f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'")
            if not result.scalar():
                conn.execute("COMMIT")
                conn.execute(f'CREATE DATABASE {db_name}')
                print(f"✅ Database '{db_name}' created")
            else:
                print(f"✅ Database '{db_name}' already exists")
            
            conn.close()
            engine.dispose()
            
    except Exception as e:
        print(f"❌ Database creation error: {str(e)}")
        
if __name__ == '__main__':
    with app.app_context():
        # Create database if it doesn't exist
        create_database_if_not_exists()
        
        try:
            # Try to connect to the database
            db.engine.connect()
            print("✅ Connected to database successfully")
            
            # Check if tables need to be created
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            if not inspector.get_table_names():
                print("📊 Creating database tables...")
                db.create_all()
                print("✅ Tables created successfully")
            else:
                print("✅ Database tables already exist")
                
            # Check if any models have changed
            from alembic.migration import MigrationContext
            from alembic.operations import Operations
            
            conn = db.engine.connect()
            ctx = MigrationContext.configure(conn)
            has_changes = False
            
            try:
                # If this doesn't raise an exception, we're synced
                if ctx.get_current_revision() is None:
                    print("🔄 Initialize migration...")
                    # If you want to initialize migrations, run: flask db init
                    has_changes = True
                else:
                    print("✅ Database is up to date with migrations")
            except Exception as e:
                print(f"🔄 Migration check: {str(e)}")
                has_changes = True
                
            conn.close()
            
            if has_changes:
                print("💡 Run 'flask db migrate' and 'flask db upgrade' to apply changes")
        except Exception as e:
            print(f"❌ Database connection error: {str(e)}")
            print("💡 Make sure your database server is running")
    
    app.run(debug=True)