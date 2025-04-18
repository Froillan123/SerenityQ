from imports import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users' 
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
    profile_picture = db.Column(db.String(255), default='images/profile.jpg')
    is_super_admin = db.Column(db.Boolean, default=False)
    language = db.Column(db.String(5), default='en')
    timezone = db.Column(db.String(10), default='-05:00')
    theme_preference = db.Column(db.String(10), default='light')
    data_collection_enabled = db.Column(db.Boolean, default=True)
    notification_preferences = db.Column(db.JSON, default={
        'email': True,
        'push': False
    })
    email_preferences = db.Column(db.JSON, default={
        'newsletter': True,
        'product_updates': True
    })
    password_changed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), 
                         onupdate=db.func.current_timestamp())

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        self.password_changed_at = db.func.current_timestamp()

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'fullname': self.fullname,
            'username': self.username,
            'email': self.email,
            'profile_picture': self.profile_picture,
            'is_super_admin': self.is_super_admin,
            'language': self.language,
            'timezone': self.timezone,
            'theme_preference': self.theme_preference,
            'data_collection_enabled': self.data_collection_enabled,
            'notification_preferences': self.notification_preferences,
            'email_preferences': self.email_preferences,
            'password_changed_at': self.password_changed_at.isoformat() if self.password_changed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
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
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class AIChat(db.Model):
    __tablename__ = 'ai_chats'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    status = db.Column(db.String(20), default='active')  # active, archived, completed
    summary = db.Column(db.Text, nullable=True)
    
    # Relationships
    messages = db.relationship('AIChatMessage', backref='chat', lazy=True, cascade='all, delete-orphan')
    user = db.relationship('User', backref='ai_chats')

class AIChatMessage(db.Model):
    __tablename__ = 'ai_chat_messages'
    
    id = db.Column(db.Integer, primary_key=True)
    chat_id = db.Column(db.Integer, db.ForeignKey('ai_chats.id', ondelete='CASCADE'), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # user, assistant
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    intent = db.Column(db.String(50), nullable=True)
    sentiment = db.Column(db.Float, nullable=True)  # -1 to 1 scale
    entities = db.Column(db.JSON, nullable=True)  # Store extracted entities
    
class AIUserPreference(db.Model):
    __tablename__ = 'ai_user_preferences'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    symptoms = db.Column(db.Text, nullable=True)
    preferred_gender = db.Column(db.String(20), nullable=True)
    preferred_language = db.Column(db.String(50), nullable=True)
    preferred_approach = db.Column(db.String(100), nullable=True)
    price_range_min = db.Column(db.Float, nullable=True)
    price_range_max = db.Column(db.Float, nullable=True)
    preferred_session_type = db.Column(db.String(20), nullable=True)  # video, phone, in-person
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)
    
    # Relationship
    user = db.relationship('User', backref='ai_preferences')

class AIMatchHistory(db.Model):
    __tablename__ = 'ai_match_history'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    psychologist_id = db.Column(db.Integer, db.ForeignKey('psychologists.id', ondelete='CASCADE'), nullable=False)
    chat_id = db.Column(db.Integer, db.ForeignKey('ai_chats.id', ondelete='CASCADE'), nullable=False)
    match_score = db.Column(db.Float, nullable=False)  # 0-1 scale
    match_reasons = db.Column(db.JSON, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='suggested')  # suggested, booked, rejected
    
    # Relationships
    user = db.relationship('User', backref='ai_matches')
    psychologist = db.relationship('Psychologist', backref='ai_matches')
    chat = db.relationship('AIChat', backref='matches')

class AIBooking(db.Model):
    __tablename__ = 'ai_bookings'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    psychologist_id = db.Column(db.Integer, db.ForeignKey('psychologists.id', ondelete='CASCADE'), nullable=False)
    chat_id = db.Column(db.Integer, db.ForeignKey('ai_chats.id', ondelete='CASCADE'), nullable=False)
    match_id = db.Column(db.Integer, db.ForeignKey('ai_match_history.id'), nullable=True)
    session_date = db.Column(db.DateTime, nullable=False)
    session_type = db.Column(db.String(20), nullable=False)  # video, phone, in-person
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, completed, cancelled
    payment_status = db.Column(db.String(20), default='pending')
    payment_method = db.Column(db.String(20), nullable=True)
    amount = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='ai_bookings')
    psychologist = db.relationship('Psychologist', backref='ai_bookings')
    chat = db.relationship('AIChat', backref='bookings')
    match = db.relationship('AIMatchHistory', backref='bookings')