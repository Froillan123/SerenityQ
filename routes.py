from flask import Blueprint, request, jsonify, render_template
from models import User
from imports import *
import secrets
from werkzeug.security import check_password_hash
from controllers import *
from auth_utils import login_required, admin_required, psychologist_required
from flask import request
from flask_jwt_extended import get_jwt_identity, set_access_cookies, unset_jwt_cookies

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
    response, status_code = handle_login()
    if status_code == 200:
        resp = jsonify(response)
        set_access_cookies(resp, response['access_token'])
        return resp, status_code
    return jsonify(response), status_code

@auth_bp.route('/logout', methods=['POST'])
def logout_api():
    response, status_code = handle_logout()
    return response, status_code

# Routes for the user side (e.g., /user)
@user_bp.context_processor
def inject_current_user():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        return {'current_user': user}
    except:
        return {'current_user': None}

@user_bp.route('/ai')
@login_required
def ai():
    return render_template('user/ai.html')

@user_bp.route('/dashboard')
@login_required
def dashboard():
    current_user_id = get_jwt_identity()
    user_data = get_user_profile(current_user_id)
    return render_template('user/dashboard.html', user=user_data)

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
    current_user_id = get_jwt_identity()
    user_data = get_user_profile(current_user_id)
    return render_template('user/user-profile.html', user=user_data)

@user_bp.route('/api/profile', methods=['GET', 'PUT'])
@login_required
def user_profile_api():
    current_user_id = get_jwt_identity()
    
    if request.method == 'GET':
        try:
            user_data = get_user_profile(current_user_id)
            return jsonify(user_data), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'PUT':
        data = request.get_json()
        try:
            result = update_user_profile(current_user_id, data)
            return jsonify(result), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@user_bp.route('/api/profile/picture', methods=['POST'])
@login_required
def update_profile_picture_api():
    current_user_id = get_jwt_identity()
    if 'profile_picture' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    try:
        result = update_profile_picture(current_user_id, request.files['profile_picture'])
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/notifications')
@login_required
def notifications():
    return render_template('user/notifications.html')

@user_bp.route('/api/change-password', methods=['POST'])
@login_required
def change_password_api():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    if not data or 'current_password' not in data or 'new_password' not in data:
        return jsonify({'error': 'Current and new password are required'}), 400
    result, status = change_password(current_user_id, data['current_password'], data['new_password'])
    return jsonify(result), status

# Admin routes
@admin_bp.route('/register', methods=['GET'])
def admin_register_page():
    return render_template('admin/admin_register.html')

@admin_bp.route('/login', methods=['GET'])
def admin_login_page():
    return render_template('admin/admin_login.html')

@admin_bp.route('/register', methods=['POST'])
def admin_register_api():
    data = request.get_json()
    try:
        response, status_code = register_admin(data)
        return jsonify(response), status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/login', methods=['POST'])
def admin_login_api():
    data = request.get_json()
    try:
        response, status_code = login_admin(data)
        resp = jsonify(response)
        if status_code == 200:
            set_access_cookies(resp, response['access_token'])
        return resp, status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/api/admin/count', methods=['GET'])
def admin_count():
    try:
        count = Admin.query.count()
        return jsonify({'count': count}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/logout', methods=['POST'])
def admin_logout_api():
    return admin_logout()

@admin_bp.route('/dashboard')
@admin_required  # Only admins can access
def admin_dashboard():
    return render_template('admin/dashboard.html')

@admin_bp.route('/users')
@admin_required  # Only admins can access
def admin_users():
    return render_template('admin/admin_user.html')

@admin_bp.route('/psychologists')
@admin_required  # Only admins can access
def admin_psychologists():
    return render_template('admin/admin_psychologist.html')

@admin_bp.route('/settings')
@admin_required  # Only admins can access
def admin_settings():
    return render_template('admin/admin_settings.html')

# Psychologist Routes
@psychologist_bp.route('/login', methods=['GET'])
def psychologist_login():
    return render_template('psychologist/psychologistLogin.html')  # Display the login page


@psychologist_bp.route('/login', methods=['POST'])
def psychologist_login_api():
    data = request.get_json()
    try:
        response, status_code = handle_psychologist_login(data)  # Pass the data
        resp = jsonify(response)
        if status_code == 200:
            set_access_cookies(resp, response['access_token'])
        return resp, status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@psychologist_bp.route('/register', methods=['GET', 'POST'])
def psychologist_register():
    if request.method == 'POST':
        return handle_psychologist_registration()  # Handle the registration logic
    return render_template('psychologist/psychologistRegister.html')  # Display the registration form

@psychologist_bp.route('/verify-otp', methods=['POST'])
def psychologist_otp_verification():
    return verify_psychologist_otp()

@psychologist_bp.route('/resend-otp', methods=['POST'])
def psychologist_resend_otp():
    return resend_psychologist_otp()

@psychologist_bp.route('/appointments', endpoint='appointments')
@psychologist_required
def psychologist_appointments():
    return render_template('psychologist/psychologistappointment.html')

@psychologist_bp.route('/dashboard', endpoint='dashboard')
@psychologist_required
def psychologist_dashboard():
    return render_template('psychologist/psychologistdashboard.html')

@psychologist_bp.route('/sessions', endpoint='sessions')
@psychologist_required
def psychologist_sessions():
    return render_template('psychologist/psychologistSession.html')

@psychologist_bp.route('/reports', endpoint='reports')
@psychologist_required
def psychologist_reports():
    return render_template('psychologist/psychologistreport.html')

@psychologist_bp.route('/settings', endpoint='settings')
@psychologist_required
def psychologist_settings():
    return render_template('psychologist/psychologistsettings.html')

@psychologist_bp.route('/logout')
@psychologist_required
def psychologist_logout():
    response = make_response(redirect(url_for('auth.landing_page')))
    unset_jwt_cookies(response)
    return response
