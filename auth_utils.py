from flask_jwt_extended import jwt_required, get_jwt_identity
from functools import wraps
from flask import jsonify
from models import User

def login_required(f):
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'error': 'Invalid user'}), 401
        return f(*args, **kwargs)
    return decorated_function