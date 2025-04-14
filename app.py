from imports import *  # Import everything from imports.py
from routes import auth_bp, user_bp, admin_bp, psychologist_bp  # Import your blueprints
from flask_migrate import Migrate
from datetime import timedelta
import os
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

if __name__ == '__main__':
    # Create tables if they don't exist (for development)
    with app.app_context():
        db.create_all()
    app.run(debug=True)