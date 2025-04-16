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
    try:
        validate_required_fields(data, ['fullname', 'username', 'email', 'password', 'secret_key'])
        
        admin_count = Admin.query.count()
        if admin_count >= 2:
            raise LimitReachedError('Maximum number of admins (2) already registered')
        
        if data.get('secret_key') != current_app.config['ADMIN_SECRET_KEY']:
            raise InvalidCredentialsError('Invalid admin secret key')
        
        if Admin.query.filter_by(username=data['username']).first():
            raise AlreadyExistsError('Username already exists')
        if Admin.query.filter_by(email=data['email']).first():
            raise AlreadyExistsError('Email already exists')
        
        admin = Admin(
            fullname=data['fullname'],
            username=data['username'],
            email=data['email'],
            is_super_admin=(admin_count == 0)
        )
        admin.set_password(data['password'])
        
        db.session.add(admin)
        db.session.commit()
        
        logger.info(f"New admin registered: {admin.username}")
        
        return {
            'message': 'Admin registered successfully',
            'admin': admin.to_dict()
        }, 201
    except ValidationError as e:
        raise
    except LimitReachedError as e:
        raise
    except InvalidCredentialsError as e:
        raise
    except AlreadyExistsError as e:
        raise
    except Exception as e:
        db.session.rollback()
        raise Exception('Failed to register admin')
    

def login_admin(data):
    try:
        validate_required_fields(data, ['username', 'password'])

        admin = Admin.query.filter_by(username=data['username']).first()
        if not admin or not admin.check_password(data['password']):
            raise InvalidCredentialsError('Invalid username or password')
        
        # Create a simple string identity (admin ID as string)
        access_token = create_access_token(
            identity=str(admin.id),  # Changed to string
            additional_claims={
                'username': admin.username,
                'is_super_admin': admin.is_super_admin,
                'role': 'admin'
            },
            expires_delta=timedelta(days=1)
        )
        
        return {
            'message': 'Login successful',
            'access_token': access_token,
            'admin': admin.to_dict(),
            'redirect': url_for('admin.admin_dashboard')
        }, 200
    except ValidationError as e:
        raise
    except InvalidCredentialsError as e:
        raise
    except Exception as e:
        raise Exception('Failed to process login')
    

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
        # Check if the request contains files
        if 'license_proof' not in request.files or 'id_proof' not in request.files:
            raise ValidationError('License proof and ID proof are required')

        # Get form data
        data = request.form
        files = request.files

        # Validate required fields
        required_fields = [
            'first_name', 'last_name', 'username', 'email', 'phone', 'password',
            'license_number', 'primary_specialty', 'years_experience', 'bio'
        ]
        for field in required_fields:
            if field not in data or not data[field]:
                raise ValidationError(f'{field.replace("_", " ").title()} is required')

        # Check if psychologist already exists
        if Psychologist.query.filter_by(email=data['email']).first():
            raise AlreadyExistsError('Email already registered')
        if Psychologist.query.filter_by(username=data['username']).first():
            raise AlreadyExistsError('Username already taken')
        if Psychologist.query.filter_by(license_number=data['license_number']).first():
            raise AlreadyExistsError('License number already registered')

        # Handle file uploads
        license_proof = files['license_proof']
        id_proof = files['id_proof']

        # Save files
        upload_folder = current_app.config['UPLOAD_FOLDER']
        os.makedirs(upload_folder, exist_ok=True)

        license_filename = f"license_{secure_filename(data['email'])}.{license_proof.filename.split('.')[-1]}"
        license_path = os.path.join(upload_folder, license_filename)
        license_proof.save(license_path)

        id_filename = f"id_{secure_filename(data['email'])}.{id_proof.filename.split('.')[-1]}"
        id_path = os.path.join(upload_folder, id_filename)
        id_proof.save(id_path)

        # Process specialties
        specialties = request.form.getlist('specialties')

        # Create psychologist (not verified or approved yet)
        psychologist = Psychologist(
            first_name=data['first_name'],
            last_name=data['last_name'],
            username=data['username'],
            email=data['email'],
            phone=data['phone'],
            password_hash=generate_password_hash(data['password']),
            license_number=data['license_number'],
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

        # Handle OTP logic
        OTP.query.filter_by(email=data['email'], otp_type='registration').delete()
        db.session.commit()

        # Create OTP
        otp_code = create_otp_record(data['email'], otp_type='registration')

        # Send OTP email
        if not send_otp_email(data['email'], otp_code):
            db.session.rollback()
            raise Exception('Failed to send OTP email')

        db.session.commit()

        return jsonify({
            'message': 'OTP sent to email',
            'email': data['email']
        }), 200

    except ValidationError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
    except AlreadyExistsError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        db.session.rollback()
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