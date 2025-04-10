# otp.py
import secrets
import string
from datetime import datetime, timedelta
from flask import current_app
from models import db, OTP

def generate_otp(length=6):
    """Generate a random numeric OTP"""
    return ''.join(secrets.choice(string.digits) for _ in range(length))

def create_otp_record(email, otp_type='registration'):
    """Create and store an OTP record in database"""
    # Delete any existing OTPs for this email
    OTP.query.filter_by(email=email, otp_type=otp_type).delete()
    
    otp_code = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=15)  # OTP valid for 15 minutes
    
    otp_record = OTP(
        email=email,
        otp_code=otp_code,
        otp_type=otp_type,
        expires_at=expires_at,
        is_used=False
    )
    
    db.session.add(otp_record)
    db.session.commit()
    
    return otp_code

def verify_otp(email, otp_code, otp_type='registration'):
    """Verify if the provided OTP is valid"""
    otp_record = OTP.query.filter_by(
        email=email,
        otp_code=otp_code,
        otp_type=otp_type,
        is_used=False
    ).first()
    
    if not otp_record:
        return False
    
    if otp_record.expires_at < datetime.utcnow():
        return False
    
    # Mark OTP as used
    otp_record.is_used = True
    db.session.commit()
    
    return True