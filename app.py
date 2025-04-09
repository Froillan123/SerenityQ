from imports import *  # Import everything from imports.py
from routes import auth_bp, user_bp, admin_bp, psychologist_bp  # Import your blueprints

app = Flask(__name__)

# Load configurations (e.g., database URI and secret key)
app.config.from_object('dbconfig')

# Initialize extensions (this will set up db and jwt)
db.init_app(app)
jwt.init_app(app)

# Register the blueprints with their prefixes
app.register_blueprint(auth_bp)  # Authentication (login, register)
app.register_blueprint(user_bp, url_prefix='/user')  # User-related pages
app.register_blueprint(admin_bp, url_prefix='/admin')  # Admin-related pages
app.register_blueprint(psychologist_bp, url_prefix='/psychologist')  # Psychologist-related pages

if __name__ == '__main__':
    app.run(debug=True)
