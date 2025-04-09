from flask import Blueprint, request, jsonify, render_template
from models import User
from imports import *
from werkzeug.security import check_password_hash
from controllers import *

# Initialize Blueprints
auth_bp = Blueprint('auth', __name__)
user_bp = Blueprint('user', __name__)
admin_bp = Blueprint('admin', __name__)
psychologist_bp = Blueprint('psychologist', __name__)

# Landing page route (for /auth)
@auth_bp.route('/')
def landing_page():
    return render_template('landing/landingpage.html') 

# Route to register a new user
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    hashed_password = generate_password_hash(password)

    new_user = User(username=username, password=hashed_password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify(message="User registered successfully"), 201

# Route to login a user and return a JWT token
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and check_password_hash(user.password, password):
        access_token = jwt.create_access_token(identity=user.id)
        return jsonify(access_token=access_token), 200
    else:
        return jsonify(message="Invalid credentials"), 401


@auth_bp.route('/logout', methods=['POST'])
def logout():
    redirect('/')

# Routes for the user side (e.g., /user)
@user_bp.route('/ai')
def serenityai():
    return render_template('user/ai.html')

@user_bp.route('/dashboard')
def dashboard():
    return render_template('user/dashboard.html')

@user_bp.route('/appointment')
def appointment():
    return render_template('user/appointment.html')

@user_bp.route('/therapist')
def therapist():
    return render_template('user/therapist.html')

@user_bp.route('/booking-history')
def booking_history():
    return render_template('user/booking-history.html')

@user_bp.route('/sessions')
def sessions():
    return render_template('user/sessions.html')

@user_bp.route('/user-profile')
def user_profile():
    return render_template('user/user-profile.html')

@user_bp.route('/notifications')
def notifications():
    return render_template('user/notifications.html')



# Routes for admin side (e.g., /admin)
@admin_bp.route('/dashboard')
def admin_dashboard():
    return render_template('admin/dashboard.html')

@admin_bp.route('/users')
def admin_users():
    return render_template('admin/users.html')


# Psychologist Routes
@psychologist_bp.route('/appointments')
def appointments():
    return render_template('psychologist/psychologistappointment.html')

@psychologist_bp.route('/dashboard')
def dashboard():  # Changed from psychologist_dashboard to match template
    return render_template('psychologist/psychologistdashboard.html')  # Note: Keeping your typo

@psychologist_bp.route('/sessions')
def sessions():  # Changed from psychologist_sessions to match template
    return render_template('psychologist/psychologistSession.html')

@psychologist_bp.route('/settings')
def settings():
    return render_template('psychologist/psychologistsettings.html')  # Add this if needed

