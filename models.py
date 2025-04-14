from imports import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    phone = db.Column(db.String(20))
    dob = db.Column(db.Date)
    gender = db.Column(db.String(20))
    profile_picture = db.Column(db.String(255), default='static/images/profile.jpg')
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_password_change = db.Column(db.DateTime)
    role = db.Column(db.String(20), default='user')
    
    def set_password(self, password):
        """Create hashed password."""
        self.password_hash = generate_password_hash(
            password,
            method='pbkdf2:sha256',
            salt_length=16
        )
        self.last_password_change = datetime.utcnow()
    
    def check_password(self, password):
        """Check hashed password."""
        return check_password_hash(self.password_hash, password)

class OTP(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False)
    otp_code = db.Column(db.String(6), nullable=False)
    otp_type = db.Column(db.String(20), nullable=False, default='registration')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    is_used = db.Column(db.Boolean, default=False, nullable=False)

    def __repr__(self):
        return f'<OTP {self.email}>'


class Admin(db.Model):
    __tablename__ = 'admins'
    
    id = db.Column(db.Integer, primary_key=True)
    fullname = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    is_super_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), 
                         onupdate=db.func.current_timestamp())
    role = db.Column(db.String(20), default='admin')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'fullname': self.fullname,
            'username': self.username,
            'email': self.email,
            'is_super_admin': self.is_super_admin,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'role': self.role
        }
        
class Psychologist(db.Model):
    __tablename__ = 'psychologists'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)  # Added username
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)  # Made phone mandatory
    password_hash = db.Column(db.String(256), nullable=False)
    license_number = db.Column(db.String(50), unique=True, nullable=False)
    license_proof = db.Column(db.String(255), nullable=False)
    id_proof = db.Column(db.String(255), nullable=False)
    primary_specialty = db.Column(db.String(50), nullable=False)
    specialties = db.Column(db.String(500))
    years_experience = db.Column(db.Integer, nullable=False)
    bio = db.Column(db.Text, nullable=False)
    profile_picture = db.Column(db.String(255), default='static/images/profile.jpg')
    is_verified = db.Column(db.Boolean, default=False)
    is_approved = db.Column(db.Boolean, default=False)  # Added admin approval flag
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_password_change = db.Column(db.DateTime)
    role = db.Column(db.String(20), default='psychologist')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        self.last_password_change = datetime.utcnow()
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'username': self.username,
            'email': self.email,
            'phone': self.phone,
            'license_number': self.license_number,
            'primary_specialty': self.primary_specialty,
            'specialties': self.specialties.split(',') if self.specialties else [],
            'years_experience': self.years_experience,
            'bio': self.bio,
            'is_verified': self.is_verified,
            'is_approved': self.is_approved,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }