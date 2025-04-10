from imports import *  # Import everything from imports.py
from routes import auth_bp, user_bp, admin_bp, psychologist_bp  # Import your blueprints
from flask_migrate import Migrate
from datetime import datetime, timedelta

app = Flask(__name__)
app.config.from_object('dbconfig')

# Initialize extensions
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



# JWT Configuration
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_COOKIE_SECURE'] = False  # Set to False for development, True in production
app.config['JWT_COOKIE_CSRF_PROTECT'] = False  # Disable for now, enable in production
app.config['JWT_SECRET_KEY'] = 'your-very-secret-key-change-this'  # Make sure this is set
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)  # Set token expiration

# Ensure JSON responses are properly formatted
@app.after_request
def after_request(response):
    if request.path.startswith('/api/'):  # Or check for specific routes
        if response.status_code >= 400:
            response = jsonify({
                'error': response.status,
                'message': response.data.decode('utf-8')
            })
            response.status_code = 400
    return response

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