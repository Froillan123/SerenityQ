from flask import jsonify, request, url_for
from flask_jwt_extended import create_access_token, set_access_cookies, unset_jwt_cookies
from models import User, db
from otp import create_otp_record, verify_otp
from email_service import send_otp_email, EmailService
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from sqlalchemy.exc import SQLAlchemyError


def handle_registration():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['first_name', 'last_name', 'email', 'username', 'password']
        for field in required_fields:
            if field not in data or not str(data[field]).strip():
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if user exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already taken'}), 400
        
        # Create user with default profile picture
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
        
        # Generate and send OTP
        otp_code = create_otp_record(data['email'])
        if not send_otp_email(data['email'], otp_code):
            db.session.rollback()
            return jsonify({'error': 'Failed to send OTP email'}), 500
            
        return jsonify({'message': 'OTP sent to email'}), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error occurred'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def verify_otp_controller():
    try:
        data = request.get_json()
        if not data or 'email' not in data or 'otp_code' not in data:
            return jsonify({'error': 'Email and OTP code are required'}), 400
            
        if verify_otp(data['email'], data['otp_code']):
            user = User.query.filter_by(email=data['email']).first()
            if user:
                user.is_verified = True
                db.session.commit()
                return jsonify({'message': 'Email verified successfully'}), 200
            return jsonify({'error': 'User not found'}), 404
        return jsonify({'error': 'Invalid or expired OTP'}), 400
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error occurred'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def handle_login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        # Validate input
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        # Find user
        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid email or password'}), 401

        # Check if user is verified
        if not user.is_verified:
            return jsonify({'error': 'Please verify your email first'}), 403

        # Create JWT token - Convert user.id to string
        access_token = create_access_token(
            identity=str(user.id),  # Convert to string here
            expires_delta=timedelta(days=7),
            additional_claims={
                'email': user.email,
                'username': user.username,
                'role': 'user'
            }
        )

        response = jsonify({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'profile_picture': url_for('static', filename=user.profile_picture, _external=True)
            },
            'redirect': url_for('user.ai')
        })
        
        # Set JWT in cookie
        set_access_cookies(response, access_token)
        return response, 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


def handle_logout():
    try:
        response = jsonify({
            'message': 'Logout successful',
            'redirect': url_for('auth.landing_page')  # Add redirect URL
        })
        unset_jwt_cookies(response)
        return response, 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500