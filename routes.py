from flask import Blueprint, request, jsonify, render_template
from models import User
from imports import *
import secrets
from werkzeug.security import check_password_hash
from sqlalchemy import extract, func
from controllers import *
from auth_utils import login_required, admin_required, psychologist_required
from flask import request
from datetime import time
from flask_jwt_extended import get_jwt_identity, set_access_cookies, unset_jwt_cookies
from datetime import datetime
import time as systime
import time as time_module  # Rename the time module to avoid conflict

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
        if status_code == 200:
            resp = jsonify(response)
            set_access_cookies(resp, response['access_token'])
            current_app.logger.info(f"Admin login successful for: {data.get('username')}")
            return resp, status_code
        else:
            current_app.logger.warning(f"Admin login failed for: {data.get('username')}")
            return jsonify(response), status_code
    except Exception as e:
        current_app.logger.error(f"Error in admin login: {str(e)}")
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

@admin_bp.context_processor
def inject_current_admin():
    try:
        current_admin_id = get_jwt_identity()
        admin = Admin.query.get(current_admin_id)
        return {'current_admin': admin}
    except:
        return {'current_admin': None}

@admin_bp.route('/dashboard')
@admin_required
def admin_dashboard():
    user_count = User.query.count()
    psychologist_count = Psychologist.query.count()
    growth_stats = get_monthly_growth_stats()
    
    return render_template('admin/dashboard.html',
                         user_count=user_count,
                         psychologist_count=psychologist_count,
                         user_percent_change=growth_stats['user_percent_change'],
                         psychologist_percent_change=growth_stats['psychologist_percent_change'])

@admin_bp.route('/users')
@admin_required  # Only admins can access
def admin_users():
    return render_template('admin/admin_user.html')



@admin_bp.route('/api/users', methods=['GET'])
@admin_required
def get_users():
    return fetch_user_from_admin()
    
    
@admin_bp.route('/api/users', methods=['POST'])
@admin_required
def create_user():
    return admin_create_user()
    

@admin_bp.route('/api/users/<int:user_id>', methods=['GET'])
@admin_required
def get_user(user_id):
   return fetch_userbyid_admin(user_id)

@admin_bp.route('/api/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    return update_user_controller(user_id)

@admin_bp.route('/api/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    return delete_user_controller(user_id)


@admin_bp.route('/api/users/registration-stats', methods=['GET'])
@admin_required
def get_user_registration_stats():
    try:
        period = request.args.get('period', 'week')
        today = datetime.now()

        if period == 'week':
            # Weekly stats: Mon–Sun of current week
            monday = today - timedelta(days=today.weekday())
            days = [(monday + timedelta(days=i)) for i in range(7)]

            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            data = []

            for day in days:
                start = day.replace(hour=0, minute=0, second=0, microsecond=0)
                end = day.replace(hour=23, minute=59, second=59, microsecond=999999)
                count = User.query.filter(User.created_at >= start, User.created_at <= end).count()
                data.append(count)

            return jsonify({
                'labels': labels,
                'data': data,
                'period': 'week',
                'week_range': f"{days[0].strftime('%b %d')} - {days[-1].strftime('%b %d')}"
            }), 200

        elif period == 'month':
            # Monthly stats by week count in current month
            first_day = today.replace(day=1)
            last_day = (first_day.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)

            weeks = []
            current_date = first_day
            week_num = 1
            while current_date <= last_day:
                week_start = current_date
                week_end = week_start + timedelta(days=6)
                if week_end > last_day:
                    week_end = last_day
                weeks.append((week_num, week_start, week_end))
                current_date = week_end + timedelta(days=1)
                week_num += 1

            labels = []
            data = []
            for i, start, end in weeks:
                count = User.query.filter(User.created_at >= start, User.created_at <= end).count()
                labels.append(f"Week {i}")
                data.append(count)

            return jsonify({
                'labels': labels,
                'data': data,
                'period': 'month',
                'month': today.strftime('%B %Y')
            }), 200

        elif period == 'year':
            # Yearly stats: Jan–Dec
            current_year = today.year
            monthly_counts = db.session.query(
                extract('month', User.created_at).label('month'),
                func.count(User.id).label('count')
            ).filter(
                extract('year', User.created_at) == current_year
            ).group_by(
                extract('month', User.created_at)
            ).order_by(
                extract('month', User.created_at)
            ).all()

            stats = {month: 0 for month in range(1, 13)}
            for month, count in monthly_counts:
                stats[int(month)] = count

            return jsonify({
                'labels': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                'data': [stats[m] for m in range(1, 13)],
                'period': 'year',
                'current_year': current_year
            }), 200

    except Exception as e:
        current_app.logger.error(f"Error getting registration stats: {str(e)}")
        return jsonify({'error': 'Failed to get registration statistics'}), 500



    
@admin_bp.route('/psychologists')
@admin_required  # Only admins can access
def admin_psychologists():
    return render_template('admin/admin_psychologist.html')

    
@admin_bp.route('/psychologists/list', methods=['GET'])
@admin_required
def get_psychologists():
    return fetch_psychologists_controller()

@admin_bp.route('/psychologists/create', methods=['POST'])
@admin_required
def create_psychologist():
    return create_psychologist_controller()

@admin_bp.route('/psychologists/<int:psychologist_id>', methods=['GET'])
@admin_required
def get_psychologist(psychologist_id):
    return fetch_psychologist_by_id_controller(psychologist_id)

@admin_bp.route('/psychologists/<int:psychologist_id>/update', methods=['PUT'])
@admin_required
def update_psychologist(psychologist_id):
    return update_psychologist_controller(psychologist_id)

@admin_bp.route('/psychologists/<int:psychologist_id>/delete', methods=['DELETE'])
@admin_required
def delete_psychologist(psychologist_id):
    return delete_psychologist_controller(psychologist_id)

@admin_bp.route('/psychologists/<int:psychologist_id>/status', methods=['PUT'])
@admin_required
def update_psychologist_status(psychologist_id):
    return update_psychologist_status_controller(psychologist_id)

@admin_bp.route('/settings')
@admin_required
def admin_settings():
    try:
        admin_id = get_jwt_identity()
        current_app.logger.info(f"Admin ID from JWT: {admin_id}")
        
        admin = Admin.query.get(admin_id)
        if not admin:
            current_app.logger.error(f"Admin not found for ID: {admin_id}")
            return redirect(url_for('admin.admin_login_page'))
            
        current_app.logger.info(f"Admin found: {admin.username}")
        return render_template('admin/admin_settings.html', current_admin=admin)
    except Exception as e:
        current_app.logger.error(f"Error in admin_settings: {str(e)}")
        return redirect(url_for('admin.admin_login_page'))

@admin_bp.route('/profile', methods=['GET', 'PUT'])
@admin_required
def admin_profile():
    admin_id = get_jwt_identity()
    admin = Admin.query.get_or_404(admin_id)
    
    if request.method == 'GET':
        return jsonify({
            'id': admin.id,
            'username': admin.username,
            'fullname': admin.fullname,
            'email': admin.email,
            'profile_picture': url_for('static', filename=admin.profile_picture) if admin.profile_picture else None,
            'created_at': admin.created_at.isoformat() if admin.created_at else None
        }), 200
    
    elif request.method == 'PUT':
        data = request.get_json()
        try:
            # Validate required fields
            if 'fullname' not in data or not data['fullname'].strip():
                return jsonify({'success': False, 'error': 'Full name is required'}), 400
                
            if 'email' not in data or not data['email'].strip():
                return jsonify({'success': False, 'error': 'Email is required'}), 400

            # Check if email is already taken by another admin
            existing_admin = Admin.query.filter(
                Admin.email == data['email'],
                Admin.id != admin_id
            ).first()
            if existing_admin:
                return jsonify({'success': False, 'error': 'Email is already in use'}), 400

            # Update fields
            admin.fullname = data['fullname'].strip()
            admin.email = data['email'].strip()
            
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Profile updated successfully',
                'profile': {
                    'id': admin.id,
                    'username': admin.username,
                    'fullname': admin.fullname,
                    'email': admin.email,
                    'profile_picture': url_for('static', filename=admin.profile_picture) if admin.profile_picture else None
                }
            }), 200
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error updating admin profile: {str(e)}")
            return jsonify({'success': False, 'error': 'Failed to update profile'}), 500
        
@admin_bp.route('/profile/picture', methods=['POST'])
@admin_required
def update_admin_profile_picture():
    admin_id = get_jwt_identity()
    admin = Admin.query.get_or_404(admin_id)

    if 'profile_picture' not in request.files:
        return jsonify({'success': False, 'error': 'No file uploaded'}), 400

    file = request.files['profile_picture']
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        try:
            # Delete old profile picture (if not the default)
            if admin.profile_picture and admin.profile_picture != 'images/profile.jpg':
                # Remove "uploads/" from stored path to avoid duplicate path segments
                stored_filename = admin.profile_picture.replace("uploads/", "")
                old_file_path = os.path.join(
                    current_app.config['UPLOAD_FOLDER'],
                    stored_filename
                )
                if os.path.exists(old_file_path):
                    os.remove(old_file_path)
                    current_app.logger.info(f"Deleted old profile picture: {old_file_path}")

            # Generate unique filename
            file_ext = file.filename.rsplit('.', 1)[1].lower()
            filename = secure_filename(f"admin_{admin_id}_{int(systime.time())}.{file_ext}")
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)

            # Create folder if it doesn't exist
            os.makedirs(os.path.dirname(filepath), exist_ok=True)

            # Save the file
            file.save(filepath)

            # Update admin profile_picture (relative to static folder)
            admin.profile_picture = f"uploads/{filename}"
            db.session.commit()

            return jsonify({
                'success': True,
                'message': 'Profile picture updated successfully',
                'profile_picture': url_for('static', filename=admin.profile_picture)
            }), 200

        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error updating profile picture: {str(e)}")
            return jsonify({'success': False, 'error': 'Failed to update profile picture'}), 500
    else:
        return jsonify({'success': False, 'error': 'Invalid file type'}), 400

@admin_bp.route('/api/admin/account', methods=['PUT'])
@admin_required
def update_admin_account():
    admin_id = get_jwt_identity()
    admin = Admin.query.get_or_404(admin_id)
    data = request.get_json()
    
    try:
        if 'language' in data:
            admin.language = data['language']
        if 'timezone' in data:
            admin.timezone = data['timezone']
        
        db.session.commit()
        return jsonify({'success': True, 'message': 'Account settings updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/api/admin/password', methods=['POST'])
@admin_required
def change_admin_password():
    admin_id = get_jwt_identity()
    admin = Admin.query.get_or_404(admin_id)
    data = request.get_json()
    
    if not data or 'current_password' not in data or 'new_password' not in data:
        return jsonify({'success': False, 'error': 'Current and new password are required'}), 400
    
    if not admin.check_password(data['current_password']):
        return jsonify({'success': False, 'error': 'Current password is incorrect'}), 401
    
    try:
        admin.set_password(data['new_password'])
        db.session.commit()
        return jsonify({'success': True, 'message': 'Password changed successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/api/admin/preferences', methods=['PUT'])
@admin_required
def update_admin_preferences():
    admin_id = get_jwt_identity()
    admin = Admin.query.get_or_404(admin_id)
    data = request.get_json()
    
    try:
        if 'theme_preference' in data:
            admin.theme_preference = data['theme_preference']
        if 'data_collection_enabled' in data:
            admin.data_collection_enabled = data['data_collection_enabled']
        if 'notification_preferences' in data:
            admin.notification_preferences = data['notification_preferences']
        if 'email_preferences' in data:
            admin.email_preferences = data['email_preferences']
        
        db.session.commit()
        return jsonify({'success': True, 'message': 'Preferences updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/api/admin/preferences/reset', methods=['POST'])
@admin_required
def reset_admin_preferences():
    admin_id = get_jwt_identity()
    admin = Admin.query.get_or_404(admin_id)
    
    try:
        admin.theme_preference = 'light'
        admin.data_collection_enabled = True
        admin.notification_preferences = {'email': True, 'push': False}
        admin.email_preferences = {'newsletter': True, 'product_updates': True}
        
        db.session.commit()
        return jsonify({'success': True, 'message': 'Preferences reset to default'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/api/psychologists/registration-stats', methods=['GET'])
@admin_required
def get_psychologist_registration_stats():
    try:
        period = request.args.get('period', 'week')
        today = datetime.now()

        if period == 'week':
            # Weekly stats: Mon–Sun of current week
            monday = today - timedelta(days=today.weekday())
            days = [(monday + timedelta(days=i)) for i in range(7)]

            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            data = []

            for day in days:
                start = day.replace(hour=0, minute=0, second=0, microsecond=0)
                end = day.replace(hour=23, minute=59, second=59, microsecond=999999)
                count = Psychologist.query.filter(Psychologist.created_at >= start, Psychologist.created_at <= end).count()
                data.append(count)

            return jsonify({
                'labels': labels,
                'data': data,
                'period': 'week',
                'week_range': f"{days[0].strftime('%b %d')} - {days[-1].strftime('%b %d')}"
            }), 200

        elif period == 'month':
            # Monthly stats by week count in current month
            first_day = today.replace(day=1)
            last_day = (first_day.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)

            weeks = []
            current_date = first_day
            week_num = 1
            while current_date <= last_day:
                week_start = current_date
                week_end = week_start + timedelta(days=6)
                if week_end > last_day:
                    week_end = last_day
                weeks.append((week_num, week_start, week_end))
                current_date = week_end + timedelta(days=1)
                week_num += 1

            labels = []
            data = []
            for i, start, end in weeks:
                count = Psychologist.query.filter(Psychologist.created_at >= start, Psychologist.created_at <= end).count()
                labels.append(f"Week {i}")
                data.append(count)

            return jsonify({
                'labels': labels,
                'data': data,
                'period': 'month',
                'month': today.strftime('%B %Y')
            }), 200

        elif period == 'year':
            # Yearly stats: Jan–Dec
            current_year = today.year
            monthly_counts = db.session.query(
                extract('month', Psychologist.created_at).label('month'),
                func.count(Psychologist.id).label('count')
            ).filter(
                extract('year', Psychologist.created_at) == current_year
            ).group_by(
                extract('month', Psychologist.created_at)
            ).order_by(
                extract('month', Psychologist.created_at)
            ).all()

            stats = {month: 0 for month in range(1, 13)}
            for month, count in monthly_counts:
                stats[int(month)] = count

            return jsonify({
                'labels': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                'data': [stats[m] for m in range(1, 13)],
                'period': 'year',
                'current_year': current_year
            }), 200

    except Exception as e:
        current_app.logger.error(f"Error getting psychologist registration stats: {str(e)}")
        return jsonify({'error': 'Failed to get registration statistics'}), 500

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

@psychologist_bp.route('/profile/update', methods=['POST'])
@psychologist_required
def update_profile():
    try:
        psychologist = Psychologist.query.get_or_404(get_jwt_identity())
        
        # Handle profile picture upload
        if 'profile_picture' in request.files:
            file = request.files['profile_picture']
            if file and allowed_file(file.filename):
                filename = secure_filename(f"profile_{psychologist.id}_{int(time_module.time())}.{file.filename.rsplit('.', 1)[1].lower()}")
                file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
                psychologist.profile_picture = f"uploads/{filename}"

        # Update other fields
        form_data = request.form
        psychologist.first_name = form_data.get('first_name', psychologist.first_name)
        psychologist.last_name = form_data.get('last_name', psychologist.last_name)
        psychologist.email = form_data.get('email', psychologist.email)
        psychologist.phone = form_data.get('phone', psychologist.phone)
        psychologist.primary_specialty = form_data.get('primary_specialty', psychologist.primary_specialty)
        psychologist.specialties = ','.join(request.form.getlist('specialties'))
        psychologist.bio = form_data.get('bio', psychologist.bio)

        db.session.commit()
        return jsonify({'message': 'Profile updated successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
