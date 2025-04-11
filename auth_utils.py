from flask_jwt_extended import jwt_required, get_jwt_identity
from functools import wraps
from flask import jsonify, make_response
from models import User
from flask_jwt_extended import verify_jwt_in_request, get_jwt

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            if not user:
                response = jsonify({'error': 'Invalid user'})
                response = add_security_headers(response)
                return response, 401
            
            resp = make_response(f(*args, **kwargs))
            resp = add_security_headers(resp)
            return resp
        except Exception as e:
            return jsonify({'error': str(e)}), 401
    return decorated_function

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()
        if not claims.get('is_super_admin', False):
            return jsonify({'error': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    return wrapper

def add_security_headers(response):
    """Add security headers to prevent caching"""
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '-1'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    return response