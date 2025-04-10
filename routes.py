from flask import Blueprint, request, jsonify, render_template
from models import User
from imports import *
from werkzeug.security import check_password_hash
from controllers import *
from auth_utils import login_required

# Initialize Blueprints
auth_bp = Blueprint('auth', __name__)
user_bp = Blueprint('user', __name__)
admin_bp = Blueprint('admin', __name__)
psychologist_bp = Blueprint('psychologist', __name__)

# Landing page route (for /auth)
@auth_bp.route('/')
def landing_page():
    return render_template('landing/landingpage.html')

@auth_bp.route('/register')
def register_page():
    return render_template('user/register.html')

@auth_bp.route('/login')
def login_page():
    return render_template('user/login.html')

@auth_bp.route('/register', methods=['POST'])
def register_api():
    return handle_registration()

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp_api():
    return verify_otp_controller()

@auth_bp.route('/login', methods=['POST'])
def login_api():
    return handle_login()

@auth_bp.route('/logout', methods=['POST'])
def logout_api():
    return handle_logout()

# Routes for the user side (e.g., /user)
@user_bp.route('/ai')
@login_required
def ai():  # Changed function name to match route
    return render_template('user/ai.html')

@user_bp.route('/dashboard')
@login_required
def dashboard():
    return render_template('user/dashboard.html')

@user_bp.route('/appointment')
@login_required
def appointment():
    return render_template('user/appointment.html')

@user_bp.route('/therapist')
@login_required
def therapist():
    return render_template('user/therapist.html')

@user_bp.route('/booking-history')
@login_required
def booking_history():
    return render_template('user/booking-history.html')

@user_bp.route('/sessions')
@login_required
def sessions():
    return render_template('user/sessions.html')

@user_bp.route('/user-profile')
@login_required
def user_profile():
    return render_template('user/user-profile.html')

@user_bp.route('/notifications')
@login_required
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
@psychologist_bp.route('/login')
def psychologist_login():
    return render_template('psychologist/psychologistLogin.html')

@psychologist_bp.route('/register')
def psychologist_register():
    return render_template('psychologist/psychologistRegister.html')

@psychologist_bp.route('/appointments')
def psychologist_appointments():
    return render_template('psychologist/psychologistappointment.html')

@psychologist_bp.route('/dashboard')
def psychologist_dashboard():
    return render_template('psychologist/psychologistdashboard.html')

@psychologist_bp.route('/sessions')
def psychologist_sessions():
    return render_template('psychologist/psychologistSession.html')

@psychologist_bp.route('/reports')
def psychologist_reports():
    return render_template('psychologist/pyschologistreport.html')

@psychologist_bp.route('/settings')
def psychologist_settings():
    return render_template('psychologist/psychologistsettings.html')