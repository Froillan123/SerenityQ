import secrets
import string
from datetime import datetime, timedelta
from models import db, OTP

def generate_otp(length=6):
    """Generate a random numeric OTP"""
    return ''.join(secrets.choice(string.digits) for _ in range(length))

def create_otp_record(email, otp_type='registration'):
    """Create and store OTP record in database"""
    # Delete any existing OTPs for this email
    OTP.query.filter_by(email=email, otp_type=otp_type).delete()
    db.session.commit()
    
    # Generate OTP
    otp_code = generate_otp()
    
    expires_at = datetime.utcnow() + timedelta(minutes=15)
    
    otp_record = OTP(
        email=email,
        otp_code=otp_code,  # Store plain OTP (temporary)
        otp_type=otp_type,
        expires_at=expires_at,
        is_used=False
    )
    
    db.session.add(otp_record)
    db.session.commit()
    
    return otp_code

def verify_otp(email, user_provided_otp, otp_type='registration'):
    """Verify if the provided OTP is valid"""
    # Debug logging
    current_time = datetime.utcnow()
    print(f"Verification attempt at: {current_time}")
    print(f"Email: {email}, OTP: {user_provided_otp}, Type: {otp_type}")

    otp_record = OTP.query.filter_by(
        email=email.lower().strip(),  # Normalize email
        otp_type=otp_type,
        is_used=False
    ).first()
    
    if not otp_record:
        print("No active OTP record found")
        return False
    
    # Debug logging
    print(f"Found OTP record: {otp_record.otp_code} (expires at: {otp_record.expires_at})")
    
    # Check if OTP is expired
    if otp_record.expires_at < current_time:
        print(f"OTP expired! Current: {current_time}, Expires: {otp_record.expires_at}")
        return False
    
    # Constant-time comparison to prevent timing attacks
    if not secrets.compare_digest(str(otp_record.otp_code), str(user_provided_otp)):
        print(f"OTP mismatch: DB has {otp_record.otp_code}, User provided {user_provided_otp}")
        return False
    
    # Mark OTP as used
    otp_record.is_used = True
    try:
        db.session.commit()
        print("OTP marked as used successfully")
        return True
    except Exception as e:
        db.session.rollback()
        print(f"Failed to mark OTP as used: {str(e)}")
        return False