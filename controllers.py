from flask import jsonify, request, url_for, current_app
from flask_jwt_extended import (
    create_access_token, 
    unset_jwt_cookies
)
from models import User, Admin, OTP, db, Psychologist
from otp import create_otp_record, verify_otp
from email_service import send_otp_email
from werkzeug.security import generate_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
from sqlalchemy.exc import SQLAlchemyError
from auth_utils import *
import os
import logging

# Set up logging
logger = logging.getLogger(__name__)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Custom Exceptions
class ValidationError(Exception):
    """Base validation error"""
    pass

class AlreadyExistsError(Exception):
    """Resource already exists"""
    pass

class LimitReachedError(Exception):
    """Limit reached"""
    pass

class InvalidCredentialsError(Exception):
    """Invalid credentials"""
    pass

class NotFoundError(Exception):
    """Resource not found"""
    pass

# Utility Functions
def validate_required_fields(data, required_fields):
    """Validate that required fields are present"""
    missing_fields = [field for field in required_fields if field not in data or not str(data[field]).strip()]
    if missing_fields:
        raise ValidationError(f"Missing required fields: {', '.join(missing_fields)}")

def handle_registration():
    try:
        data = request.get_json()
        validate_required_fields(data, ['first_name', 'last_name', 'email', 'username', 'password'])
        
        # Check if user already exists (including unverified ones)
        existing_user = User.query.filter_by(email=data['email']).first()
        
        if existing_user:
            # If user exists but is unverified and registration is older than 30 minutes, delete it
            if not existing_user.is_verified and (datetime.utcnow() - existing_user.created_at) > timedelta(minutes=30):
                db.session.delete(existing_user)
                db.session.commit()
            else:
                raise AlreadyExistsError('Email already registered')
        
        if User.query.filter_by(username=data['username']).first():
            raise AlreadyExistsError('Username already taken')
        
        # Check resend attempts
        resend_attempt = data.get('resend_attempt', 0)
        if resend_attempt >= 4:
            # Check if last attempt was within 5 minutes
            last_otp = OTP.query.filter_by(email=data['email'], is_used=False).order_by(OTP.created_at.desc()).first()
            if last_otp and (datetime.utcnow() - last_otp.created_at) < timedelta(minutes=5):
                return {'error': 'Too many attempts', 'cooldown': 5}, 429
        
        user = User(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            username=data['username'],
            phone=data.get('phone', ''),
            dob=datetime.strptime(data['dob'], '%Y-%m-%d').date() if data.get('dob') else None,
            gender=data.get('gender', ''),
            profile_picture='images/profile.jpg',
            is_verified=False
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Delete any existing OTPs for this email
        OTP.query.filter_by(email=data['email'], otp_type='registration').delete()
        db.session.commit()
        
        otp_code = create_otp_record(data['email'])
        if not send_otp_email(data['email'], otp_code):
            db.session.rollback()
            raise Exception('Failed to send OTP email')
            
        return {'message': 'OTP sent to email'}, 200
        
    except ValidationError as e:
        return {'error': str(e)}, 400
    except AlreadyExistsError as e:
        return {'error': str(e)}, 400
    except SQLAlchemyError:
        db.session.rollback()
        return {'error': 'Database error occurred'}, 500
    except Exception as e:
        return {'error': str(e)}, 500

def verify_otp_controller():
    try:
        data = request.get_json()
        validate_required_fields(data, ['email', 'otp_code'])
            
        if not verify_otp(data['email'], data['otp_code']):
            raise InvalidCredentialsError('Invalid or expired OTP')
            
        user = User.query.filter_by(email=data['email']).first()
        if not user:
            raise NotFoundError('User not found')
            
        user.is_verified = True
        db.session.commit()
        return {'message': 'Email verified successfully'}, 200
        
    except ValidationError as e:
        return {'error': str(e)}, 400
    except InvalidCredentialsError as e:
        return {'error': str(e)}, 400
    except NotFoundError as e:
        return {'error': str(e)}, 404
    except SQLAlchemyError:
        db.session.rollback()
        return {'error': 'Database error occurred'}, 500
    except Exception as e:
        return {'error': str(e)}, 500

def handle_login():
    try:
        data = request.get_json()
        validate_required_fields(data, ['login', 'password'])
        
        # Check if login is email or username
        login = data['login'].strip()
        password = data['password']
        
        # Query user by email or username
        user = User.query.filter(
            (User.email == login) | (User.username == login)
        ).first()
        
        if not user or not user.check_password(password):
            raise InvalidCredentialsError('Invalid login credentials')
            
        if not user.is_verified:
            raise InvalidCredentialsError('Please verify your email first')
            
        # Create access token
        access_token = create_access_token(
            identity=str(user.id),
            expires_delta=timedelta(days=7),
            additional_claims={
                'email': user.email,
                'username': user.username,
                'role': user.role
            }
        )
        
        return {
            'message': 'Login successful',
            'access_token': access_token,
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'profile_picture': url_for('static', filename=user.profile_picture, _external=True)
            },
            'redirect': url_for('user.ai')
        }, 200
        
    except ValidationError as e:
        return {'error': str(e)}, 400
    except InvalidCredentialsError as e:
        return {'error': str(e)}, 401
    except Exception as e:
        return {'error': str(e)}, 500

def handle_logout():
    try:
        response = jsonify({
            'message': 'Logout successful',
            'redirect': url_for('auth.landing_page')
        })
        unset_jwt_cookies(response)  # This clears the JWT cookies
        return response, 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# User Profile Controllers
def get_user_profile(current_user_id):
    try:
        user = User.query.get(current_user_id)
        if not user:
            raise NotFoundError('User not found')
        
        return {
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'username': user.username,
            'phone': user.phone,
            'dob': user.dob,
            'gender': user.gender,
            'profile_picture': user.profile_picture,
            'created_at': user.created_at,
            'last_password_change': user.last_password_change
        }
    except NotFoundError as e:
        raise
    except Exception as e:
        logger.error(f"Error getting user profile: {str(e)}")
        raise Exception('Failed to get user profile')

def update_user_profile(current_user_id, data):
    try:
        user = User.query.get(current_user_id)
        if not user:
            raise NotFoundError('User not found')
        
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'phone' in data:
            user.phone = data['phone']
        if 'dob' in data and data['dob']:
            user.dob = datetime.strptime(data['dob'], '%Y-%m-%d').date()
        if 'gender' in data:
            user.gender = data['gender']
        
        db.session.commit()
        return {'message': 'Profile updated successfully'}
    except NotFoundError as e:
        raise
    except Exception as e:
        db.session.rollback()
        raise Exception('Failed to update profile')

def update_profile_picture(current_user_id, file):
    try:
        user = User.query.get(current_user_id)
        if not user:
            raise NotFoundError('User not found')
        
        if not file:
            raise ValidationError('No file uploaded')
        
        # Remove old profile picture if exists
        if user.profile_picture:
            old_picture_path = os.path.join(current_app.config['UPLOAD_FOLDER'], user.profile_picture)
            if os.path.exists(old_picture_path):
                os.remove(old_picture_path)

        # Set new profile picture name as the user's email with .png extension
        filename = f"{user.email}.png"
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        # Save the new file
        file.save(filepath)
        
        # Update profile picture path (relative to static folder)
        user.profile_picture = f"uploads/{filename}"
        db.session.commit()
        
        return {
            'message': 'Profile picture updated successfully',
            'profile_picture': url_for('static', filename=user.profile_picture, _external=True)
        }
    
    except ValidationError as e:
        raise
    except NotFoundError as e:
        raise
    except Exception as e:
        db.session.rollback()
        raise Exception('Failed to update profile picture')

def change_password(current_user_id, current_password, new_password):
    try:
        user = User.query.get(current_user_id)
        if not user:
            raise NotFoundError('User not found')
        
        if not user.check_password(current_password):
            raise InvalidCredentialsError('Current password is incorrect')
            
        user.set_password(new_password)
        db.session.commit()
        
        return {'message': 'Password changed successfully'}, 200
    except NotFoundError as e:
        raise
    except InvalidCredentialsError as e:
        raise
    except Exception as e:
        db.session.rollback()
        raise Exception('Failed to change password')

# Admin Controllers
def register_admin(data):
    """
    Register a new admin with validation and error handling
    """
    try:
        # Validate required fields
        required_fields = ['fullname', 'username', 'email', 'password', 'secret_key']
        if not all(field in data for field in required_fields):
            raise ValueError('All required fields must be provided')

        # Check admin limit
        admin_count = db.session.query(Admin).count()
        if admin_count >= 2:
            raise ValueError('Maximum number of admins (2) already registered')

        # Validate secret key
        if data['secret_key'] != current_app.config['ADMIN_SECRET_KEY']:
            raise ValueError('Invalid admin secret key')

        # Check for existing username or email
        if db.session.query(Admin).filter_by(username=data['username']).first():
            raise ValueError('Username already exists')
        if db.session.query(Admin).filter_by(email=data['email']).first():
            raise ValueError('Email already exists')

        # Create new admin with default values
        admin = Admin(
            fullname=data['fullname'],
            username=data['username'],
            email=data['email'],
            is_super_admin=(admin_count == 0),  # First admin is super admin
            profile_picture='images/profile.jpg',  # Set default profile picture
            language='en',
            timezone='+08:00',
            theme_preference='light',
            data_collection_enabled=True,
            notification_preferences={'email': True, 'push': False},
            email_preferences={'newsletter': True, 'product_updates': True}
        )
        admin.set_password(data['password'])

        db.session.add(admin)
        db.session.commit()

        current_app.logger.info(f"New admin registered: {admin.username}")

        return {
            'success': True,
            'message': 'Admin registered successfully',
            'admin': admin.to_dict()
        }, 201

    except ValueError as e:
        db.session.rollback()
        return {
            'success': False,
            'error': str(e)
        }, 400
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Admin registration failed: {str(e)}')
        return {
            'success': False,
            'error': 'Failed to register admin. Please try again.'
        }, 500
    

def login_admin(data):
    """
    Authenticate admin and return access token
    """
    try:
        # Validate required fields
        if 'username' not in data or 'password' not in data:
            raise ValueError('Username and password are required')

        admin = db.session.query(Admin).filter_by(username=data['username']).first()
        if not admin or not admin.check_password(data['password']):
            raise ValueError('Invalid username or password')

        # Create access token
        access_token = create_access_token(
            identity=str(admin.id),
            additional_claims={
                'username': admin.username,
                'is_super_admin': admin.is_super_admin,
                'role': 'admin'
            },
            expires_delta=timedelta(days=1))
        
        # Update last login time (if you add this field to your model)
        # admin.last_login = datetime.utcnow()
        db.session.commit()

        return {
            'success': True,
            'message': 'Login successful',
            'access_token': access_token,
            'admin': admin.to_dict()
        }, 200

    except ValueError as e:
        return {
            'success': False,
            'error': str(e)
        }, 401
    except Exception as e:
        current_app.logger.error(f'Admin login failed: {str(e)}')
        return {
            'success': False,
            'error': 'Login failed. Please try again.'
        }, 500
    
    
def get_admin_count():
    """
    Get the current number of registered admins
    """
    try:
        count = db.session.query(Admin).count()
        return {
            'success': True,
            'count': count
        }, 200
    except Exception as e:
        current_app.logger.error(f'Failed to get admin count: {str(e)}')
        return {
            'success': False,
            'error': 'Failed to get admin count'
        }, 500

def admin_logout():
    try:
        # Create response data
        response_data = {
            'message': 'Admin logout successful',
            'redirect': '/admin/login'  # Direct URL instead of url_for to avoid context issues
        }
        
        # Create the response object
        response = jsonify(response_data)
        
        # Clear JWT cookies
        unset_jwt_cookies(response)
        
        # Add cache prevention headers
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        
        return response
        
    except Exception as e:
        current_app.logger.error(f"Admin logout error: {str(e)}")
        return jsonify({'error': 'Failed to logout'}), 500
    
    
def admin_create_user():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['first_name', 'last_name', 'email', 'username', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check for existing users
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
            
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already taken'}), 400
        
        # Create the user (automatically verified since admin is creating)
        user = User(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            username=data['username'],
            phone=data.get('phone'),
            dob=datetime.strptime(data['dob'], '%Y-%m-%d').date() if data.get('dob') else None,
            gender=data.get('gender', 'Prefer not to say'),
            profile_picture=data.get('profile_picture', 'images/profile.jpg'),
            is_verified=True  # Automatically verified for admin-created users
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Return the created user data
        user_data = {
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'username': user.username,
            'email': user.email,
            'phone': user.phone,
            'dob': user.dob.strftime('%Y-%m-%d') if user.dob else None,
            'gender': user.gender,
            'is_verified': user.is_verified,
            'created_at': user.created_at.strftime('%B %d, %Y')
        }
        
        return jsonify(user_data), 201
        
    except ValueError as e:
        db.session.rollback()
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating user: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
    

def fetch_user_from_admin():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 5, type=int)
        
        users = User.query.paginate(page=page, per_page=per_page, error_out=False)
        
        users_data = []
        for user in users.items:
            users_data.append({
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'username': user.username,
                'email': user.email,
                'phone': user.phone,
                'dob': user.dob.strftime('%Y-%m-%d') if user.dob else None,
                'gender': user.gender,
                'created_at': user.created_at.strftime('%B %d, %Y'),
                'is_verified': user.is_verified,
                'profile_picture': url_for('static', filename=user.profile_picture)
            })
        
        return jsonify({
            'users': users_data,
            'total': users.total,
            'pages': users.pages,
            'current_page': users.page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

def fetch_userbyid_admin(user_id):
    try:
        user = User.query.get_or_404(user_id)

        user_data = {
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'middle_name': '',  # Add if you have this field
            'username': user.username,
            'email': user.email,
            'phone': user.phone,
            'dob': user.dob.strftime('%Y-%m-%d') if user.dob else None,
            'gender': user.gender,
            'created_at': user.created_at.strftime('%B %d, %Y'),
            'is_verified': user.is_verified,
            'profile_picture': url_for('static', filename=user.profile_picture)
        }

        return jsonify(user_data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


def update_user_controller(user_id):
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'username' in data:
            if User.query.filter(User.username == data['username'], User.id != user_id).first():
                return jsonify({'error': 'Username already taken'}), 400
            user.username = data['username']
        if 'email' in data:
            if User.query.filter(User.email == data['email'], User.id != user_id).first():
                return jsonify({'error': 'Email already registered'}), 400
            user.email = data['email']
        if 'phone' in data:
            user.phone = data['phone']
        if 'dob' in data:
            user.dob = datetime.strptime(data['dob'], '%Y-%m-%d').date() if data['dob'] else None
        if 'gender' in data:
            user.gender = data['gender']
        
        db.session.commit()
        
        return jsonify({'message': 'User updated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    

def delete_user_controller(user_id):
    try:
        user = User.query.get_or_404(user_id)
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'User deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    
    
    
def get_monthly_growth_stats():
    try:
        from sqlalchemy import extract
        from datetime import datetime
        
        # Get current date and calculate previous month
        now = datetime.utcnow()
        current_month = now.month
        current_year = now.year
        
        # Calculate previous month (handle year change)
        if current_month == 1:
            prev_month = 12
            prev_year = current_year - 1
        else:
            prev_month = current_month - 1
            prev_year = current_year
        
        # Get user counts for current and previous month
        current_month_users = User.query.filter(
            extract('month', User.created_at) == current_month,
            extract('year', User.created_at) == current_year
        ).count()
        
        prev_month_users = User.query.filter(
            extract('month', User.created_at) == prev_month,
            extract('year', User.created_at) == prev_year
        ).count()
        
        # Get psychologist counts for current and previous month
        current_month_psychologists = Psychologist.query.filter(
            extract('month', Psychologist.created_at) == current_month,
            extract('year', Psychologist.created_at) == current_year
        ).count()
        
        prev_month_psychologists = Psychologist.query.filter(
            extract('month', Psychologist.created_at) == prev_month,
            extract('year', Psychologist.created_at) == prev_year
        ).count()
        
        # Calculate percentage changes (handle division by zero)
        user_percent_change = 0
        if prev_month_users > 0:
            user_percent_change = ((current_month_users - prev_month_users) / prev_month_users) * 100
        
        psychologist_percent_change = 0
        if prev_month_psychologists > 0:
            psychologist_percent_change = ((current_month_psychologists - prev_month_psychologists) / prev_month_psychologists) * 100
        
        return {
            'user_percent_change': round(user_percent_change, 1),
            'psychologist_percent_change': round(psychologist_percent_change, 1)
        }
        
    except Exception as e:
        current_app.logger.error(f"Error getting growth stats: {str(e)}")
        return {
            'user_percent_change': 0,
            'psychologist_percent_change': 0
        }
    

    
def verify_psychologist_otp():
    try:
        data = request.get_json()
        validate_required_fields(data, ['email', 'otp_code'])
            
        if not verify_otp(data['email'], data['otp_code']):
            raise InvalidCredentialsError('Invalid or expired OTP')
            
        psychologist = Psychologist.query.filter_by(email=data['email']).first()
        if not psychologist:
            raise NotFoundError('Psychologist not found')
            
        psychologist.is_verified = True
        db.session.commit()
        
        return jsonify({
            'message': 'Email verified successfully',
            'redirect': '/psychologist/login'
        }), 200
        
    except ValidationError as e:
        return jsonify({'error': str(e)}), 400
    except InvalidCredentialsError as e:
        return jsonify({'error': str(e)}), 400
    except NotFoundError as e:
        return jsonify({'error': str(e)}), 404
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({'error': 'Database error occurred'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def handle_psychologist_registration():
    try:
        print("Received psychologist registration request.")

        # Check if the request contains files
        if 'license_proof' not in request.files or 'id_proof' not in request.files:
            print("Missing required files.")
            raise ValidationError('License proof and ID proof are required')

        # Get form data
        data = request.form
        files = request.files
        print("Form and file data received.")

        # Validate required fields
        required_fields = [
            'first_name', 'last_name', 'username', 'email', 'phone', 'password',
            'license_number', 'primary_specialty', 'years_experience', 'bio'
        ]
        for field in required_fields:
            if field not in data or not data[field]:
                print(f"Missing required field: {field}")
                raise ValidationError(f'{field.replace("_", " ").title()} is required')
        print("All required fields validated.")

        # Normalize input values
        input_email = data['email'].strip().lower()
        input_username = data['username'].strip().lower()
        input_license_number = data['license_number'].strip().lower()

        # Check for duplicates
        if Psychologist.query.filter(db.func.lower(Psychologist.email) == input_email).first():
            print("Email already registered.")
            raise AlreadyExistsError('Email already registered')

        if Psychologist.query.filter(db.func.lower(Psychologist.username) == input_username).first():
            print("Username already taken.")
            raise AlreadyExistsError('Username already taken')

        # Custom license number duplicate check (normalize and compare)
        existing_licenses = Psychologist.query.with_entities(Psychologist.license_number).all()
        for (existing_license,) in existing_licenses:
            if existing_license and existing_license.strip().lower() == input_license_number:
                print(f"Duplicate license detected: {existing_license}")
                raise AlreadyExistsError('License number already registered')
        print("No duplicate psychologist found.")

        # Handle file uploads
        license_proof = files['license_proof']
        id_proof = files['id_proof']
        print("Files received.")

        # Save files
        upload_folder = current_app.config['UPLOAD_FOLDER']
        os.makedirs(upload_folder, exist_ok=True)

        license_filename = f"license_{secure_filename(data['email'])}.{license_proof.filename.split('.')[-1]}"
        license_path = os.path.join(upload_folder, license_filename)
        license_proof.save(license_path)
        print(f"License proof saved to {license_path}")

        id_filename = f"id_{secure_filename(data['email'])}.{id_proof.filename.split('.')[-1]}"
        id_path = os.path.join(upload_folder, id_filename)
        id_proof.save(id_path)
        print(f"ID proof saved to {id_path}")

        # Process specialties
        specialties = request.form.getlist('specialties')
        print(f"Specialties: {specialties}")

        # Create psychologist
        psychologist = Psychologist(
            first_name=data['first_name'],
            last_name=data['last_name'],
            username=data['username'],
            email=data['email'],
            phone=data['phone'],
            password_hash=generate_password_hash(data['password']),
            license_number=data['license_number'],  # You can also save input_license_number if you want it cleaned
            license_proof=license_filename,
            id_proof=id_filename,
            primary_specialty=data['primary_specialty'],
            specialties=','.join(specialties),
            years_experience=int(data['years_experience']),
            bio=data['bio'],
            is_verified=False,
            is_approved=False
        )

        db.session.add(psychologist)
        print("Psychologist object created and added to session.")

        # Remove old OTPs
        OTP.query.filter_by(email=data['email'], otp_type='registration').delete()
        db.session.commit()
        print("Old OTPs deleted.")

        # Create new OTP
        otp_code = create_otp_record(data['email'], otp_type='registration')
        print(f"Generated OTP: {otp_code}")

        # Send OTP
        if not send_otp_email(data['email'], otp_code):
            print("Failed to send OTP email.")
            db.session.rollback()
            raise Exception('Failed to send OTP email')

        db.session.commit()
        print("Psychologist registration committed.")

        return jsonify({
            'message': 'OTP sent to email',
            'email': data['email']
        }), 200

    except ValidationError as e:
        db.session.rollback()
        print(f"Validation error: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except AlreadyExistsError as e:
        db.session.rollback()
        print(f"Duplicate error: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        print(f"Unhandled exception: {str(e)}")
        current_app.logger.error(f"Registration error: {str(e)}")
        return jsonify({'error': str(e)}), 500

        

def handle_psychologist_login(data):
    try:
        validate_required_fields(data, ['login', 'password'])

        # Check if login is email or username
        login = data['login'].strip()
        password = data['password']
        
        # Query psychologist by email or username
        psychologist = Psychologist.query.filter(
            (Psychologist.email == login) | (Psychologist.username == login)
        ).first()
        
        if not psychologist or not psychologist.check_password(password):
            raise InvalidCredentialsError('Invalid login credentials')
            
        if not psychologist.is_verified:
            raise InvalidCredentialsError('Please verify your email first. Check your inbox for the verification email.')
            
            
        # Create access token
        access_token = create_access_token(
            identity=str(psychologist.id),
            expires_delta=timedelta(days=7),
            additional_claims={
                'email': psychologist.email,
                'username': psychologist.username,
                'role': 'psychologist'
            }
        )
        
        return {
            'message': 'Login successful',
            'access_token': access_token,
            'psychologist': psychologist.to_dict(),
            'redirect': url_for('psychologist.appointments')
        }, 200
        
    except ValidationError as e:
        return {'error': str(e)}, 400
    except InvalidCredentialsError as e:
        return {'error': str(e)}, 401
    except Exception as e:
        return {'error': str(e)}, 500
    
def handle_psychologist_logout():
    try:
        # Create response data
        response_data = {
            'message': 'Logout successful',
            'redirect': url_for('auth.landing_page')  # Redirect to the landing page after logout
        }
        
        # Create the response object
        response = jsonify(response_data)
        
        # Clear JWT cookies
        unset_jwt_cookies(response)
        
        # Add cache prevention headers
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        
        return response
        
    except Exception as e:
        current_app.logger.error(f"Psychologist logout error: {str(e)}")
        return jsonify({'error': 'Failed to logout'}), 500
    
    
def resend_psychologist_otp():
    try:
        data = request.get_json()
        validate_required_fields(data, ['email'])
        
        # Check if psychologist exists
        psychologist = Psychologist.query.filter_by(email=data['email']).first()
        if not psychologist:
            raise NotFoundError('Psychologist not found')
        
        # Delete existing OTPs
        OTP.query.filter_by(email=data['email'], otp_type='registration').delete()
        db.session.commit()
        
        # Create new OTP
        otp_code = create_otp_record(data['email'], otp_type='registration')
        
        # Send OTP email
        if not send_otp_email(data['email'], otp_code):
            raise Exception('Failed to send OTP email')
            
        return jsonify({'message': 'New OTP sent successfully'}), 200
        
    except ValidationError as e:
        return jsonify({'error': str(e)}), 400
    except NotFoundError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
        

def fetch_psychologists_controller():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        psychologists = Psychologist.query.paginate(page=page, per_page=per_page, error_out=False)
        
        psychologists_data = []
        for psychologist in psychologists.items:
            psychologists_data.append({
                'id': psychologist.id,
                'first_name': psychologist.first_name,
                'last_name': psychologist.last_name,
                'email': psychologist.email,
                'phone': psychologist.phone,
                'primary_specialty': psychologist.primary_specialty,
                'specialties': psychologist.specialties.split(',') if psychologist.specialties else [],
                'years_experience': psychologist.years_experience,
                'is_verified': psychologist.is_verified,
                'is_approved': psychologist.is_approved,
                'created_at': psychologist.created_at.strftime('%B %d, %Y'),
                'profile_picture': url_for('static', filename=psychologist.profile_picture)
            })
        
        return jsonify({
            'psychologists': psychologists_data,
            'total': psychologists.total,
            'pages': psychologists.pages,
            'current_page': psychologists.page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def create_psychologist_controller():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['first_name', 'last_name', 'email', 'phone', 'password',
                         'license_number', 'primary_specialty', 'years_experience', 'bio']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check for existing psychologist
        if Psychologist.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
        if Psychologist.query.filter_by(license_number=data['license_number']).first():
            return jsonify({'error': 'License number already registered'}), 400
        
        # Create username from email
        username = data['email'].split('@')[0]
        base_username = username
        counter = 1
        while Psychologist.query.filter_by(username=username).first():
            username = f"{base_username}{counter}"
            counter += 1
        
        psychologist = Psychologist(
            first_name=data['first_name'],
            last_name=data['last_name'],
            username=username,
            email=data['email'],
            phone=data['phone'],
            license_number=data['license_number'],
            primary_specialty=data['primary_specialty'],
            specialties=','.join(data.get('specialties', [])),
            years_experience=data['years_experience'],
            bio=data['bio'],
            is_verified=True,  # Auto-verify when created by admin
            is_approved=True,  # Auto-approve when created by admin
            profile_picture='images/profile.jpg'
        )
        psychologist.set_password(data['password'])
        
        db.session.add(psychologist)
        db.session.commit()
        
        return jsonify(psychologist.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

def fetch_psychologist_by_id_controller(psychologist_id):
    try:
        psychologist = Psychologist.query.get_or_404(psychologist_id)
        return jsonify(psychologist.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def update_psychologist_controller(psychologist_id):
    try:
        psychologist = Psychologist.query.get_or_404(psychologist_id)
        data = request.get_json()
        
        # Update fields if provided
        if 'first_name' in data:
            psychologist.first_name = data['first_name']
        if 'last_name' in data:
            psychologist.last_name = data['last_name']
        if 'email' in data:
            if Psychologist.query.filter(
                Psychologist.email == data['email'],
                Psychologist.id != psychologist_id
            ).first():
                return jsonify({'error': 'Email already registered'}), 400
            psychologist.email = data['email']
        if 'phone' in data:
            psychologist.phone = data['phone']
        if 'license_number' in data:
            if Psychologist.query.filter(
                Psychologist.license_number == data['license_number'],
                Psychologist.id != psychologist_id
            ).first():
                return jsonify({'error': 'License number already registered'}), 400
            psychologist.license_number = data['license_number']
        if 'primary_specialty' in data:
            psychologist.primary_specialty = data['primary_specialty']
        if 'specialties' in data:
            psychologist.specialties = ','.join(data['specialties'])
        if 'years_experience' in data:
            psychologist.years_experience = data['years_experience']
        if 'bio' in data:
            psychologist.bio = data['bio']
        if 'password' in data:
            psychologist.set_password(data['password'])
        
        db.session.commit()
        return jsonify(psychologist.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

def delete_psychologist_controller(psychologist_id):
    try:
        psychologist = Psychologist.query.get_or_404(psychologist_id)
        db.session.delete(psychologist)
        db.session.commit()
        return jsonify({'message': 'Psychologist deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

def update_psychologist_status_controller(psychologist_id):
    try:
        psychologist = Psychologist.query.get_or_404(psychologist_id)
        data = request.get_json()
        
        if 'is_approved' in data:
            psychologist.is_approved = data['is_approved']
        if 'is_verified' in data:
            psychologist.is_verified = data['is_verified']
            
        db.session.commit()
        return jsonify(psychologist.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500