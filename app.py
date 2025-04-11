from imports import *  # Import everything from imports.py
from routes import auth_bp, user_bp, admin_bp, psychologist_bp  # Import your blueprints
from flask_migrate import Migrate
from datetime import datetime, timedelta
import os
app = Flask(__name__)
app.config.from_object('dbconfig')

# Initialize extensions
CORS(app, supports_credentials=True)
db.init_app(app)
jwt.init_app(app)
migrate = Migrate(app, db)  # Add this line to initialize Flask-Migrate

# Configure email settings
app.config['MAIL_SERVER'] = 'smtp.gmail.com'  # Use 'MAIL_SERVER' instead of 'SMTP_SERVER'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True  # Enable TLS encryption
app.config['MAIL_USERNAME'] = 'serenityq143@gmail.com'  # Your new Gmail
app.config['MAIL_PASSWORD'] = 'ofel qkqc rnnx lbkc'  # Paste the app password here
app.config['MAIL_DEFAULT_SENDER'] = 'serenityq143@gmail.com'  # Default "From" address



app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'static', 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size


# JWT Configuration
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_COOKIE_SECURE'] = False  # Set to False for development, True in production
app.config['JWT_COOKIE_CSRF_PROTECT'] = False  # Disable for now, enable in production
app.config['JWT_SECRET_KEY'] = jwt_secret_key  
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)  # Set token expiration

# Ensure JSON responses are properly formatted
@app.after_request
def add_no_cache_headers(response):
    """Add headers to prevent caching for all responses"""
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '-1'
    return response


app.config['ADMIN_SECRET_KEY'] = admin_secret_key
# Register blueprints

@app.route('/')
def root_landing_page():
    return render_template('landing/landingpage.html')

app.register_blueprint(auth_bp, url_prefix='/auth') 
app.register_blueprint(user_bp, url_prefix='/user') 
app.register_blueprint(admin_bp, url_prefix='/admin')  
app.register_blueprint(psychologist_bp, url_prefix='/psychologist') 

if __name__ == '__main__':
    app.run(debug=True)