from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request, get_jwt
from functools import wraps
from flask import  make_response, redirect, url_for
from models import User, Psychologist, Admin
from flask_jwt_extended import unset_jwt_cookies
from flask import current_app

def add_security_headers(response):
    """Add security headers to prevent caching"""
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '-1'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    return response

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            jwt_data = get_jwt()
            
            # Check if this is a user token
            if isinstance(get_jwt_identity(), str):  # User IDs are stored as strings
                user = User.query.get(get_jwt_identity())
                if not user:
                    return redirect(url_for('auth.login_page'))
                
                resp = make_response(f(*args, **kwargs))
                resp = add_security_headers(resp)
                return resp
            
            # If not a user token, check if it's admin or psychologist
            if jwt_data.get('role') in ['admin', 'psychologist']:
                # Force logout since they're trying to access user routes
                response = redirect(url_for('auth.landing_page'))
                unset_jwt_cookies(response)
                return response
                
            # If none of the above, redirect to login
            return redirect(url_for('auth.login_page'))
            
        except Exception as e:
            current_app.logger.error(f"Authentication error: {str(e)}")
            return redirect(url_for('auth.login_page'))
    return decorated_function

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            claims = get_jwt()
            
            if claims.get('role') != 'admin':
                # Force logout if not admin
                response = redirect(url_for('admin.admin_login_page'))
                unset_jwt_cookies(response)
                return response
                
            return fn(*args, **kwargs)
        except Exception as e:
            current_app.logger.error(f"Admin auth error: {str(e)}")
            return redirect(url_for('admin.admin_login_page'))
    return wrapper

def psychologist_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            print("Verifying JWT in request...")
            verify_jwt_in_request()
            claims = get_jwt()
            identity = get_jwt_identity()
            
            print(f"Claims received: {claims}")  # Print the claims for debugging
            print(f"Identity received: {identity}")  # Print the identity for debugging
            
            if claims.get('role') != 'psychologist':
                print("User is not a psychologist. Redirecting to psychologist login.")
                # Force logout if not psychologist
                response = redirect(url_for('psychologist.psychologist_login'))
                unset_jwt_cookies(response)
                return response
            
            # Verify the psychologist exists
            psychologist = Psychologist.query.get(identity)
            if not psychologist:
                print("Psychologist not found in database.")
                response = redirect(url_for('psychologist.psychologist_login'))
                unset_jwt_cookies(response)
                return response
            
            print("User is a psychologist. Proceeding with the request.")
            return fn(*args, **kwargs)
        except Exception as e:
            current_app.logger.error(f"Psychologist auth error: {str(e)}")
            print(f"Error occurred: {str(e)}")  # Print error for debugging
            return redirect(url_for('psychologist.psychologist_login'))
    
    return wrapper