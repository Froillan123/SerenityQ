from flask import jsonify, request, url_for, current_app
from flask_jwt_extended import (
    create_access_token, 
    set_access_cookies, 
    unset_jwt_cookies,
    get_jwt_identity
)
from models import User, Admin, db
from otp import create_otp_record, verify_otp
from email_service import send_otp_email
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from sqlalchemy.exc import SQLAlchemyError
from auth_utils import add_security_headers
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

# User Authentication Controllers
def handle_registration():
    try:
        data = request.get_json()
        validate_required_fields(data, ['first_name', 'last_name', 'email', 'username', 'password'])
        
        if User.query.filter_by(email=data['email']).first():
            raise AlreadyExistsError('Email already registered')
        
        if User.query.filter_by(username=data['username']).first():
            raise AlreadyExistsError('Username already taken')
        
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
        validate_required_fields(data, ['email', 'password'])

        user = User.query.filter_by(email=data['email']).first()
        if not user or not user.check_password(data['password']):
            raise InvalidCredentialsError('Invalid email or password')

        if not user.is_verified:
            raise InvalidCredentialsError('Please verify your email first')

        access_token = create_access_token(
            identity=str(user.id),
            expires_delta=timedelta(days=7),
            additional_claims={
                'email': user.email,
                'username': user.username,
                'role': 'user'
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
            
        filename = f"user_{current_user_id}_{file.filename}"
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
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
        
        access_token = create_access_token(
            identity={
                'id': admin.id,
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
        response = {
            'message': 'Admin logout successful',
            'redirect': url_for('admin.admin_login_page')
        }
        return response, 200
    except Exception as e:
        current_app.logger.error(f"Admin logout error: {str(e)}")
        return {'error': 'Failed to logout'}, 500