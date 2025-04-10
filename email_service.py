import smtplib
from email.mime.text import MIMEText
from flask import current_app

class EmailService:
    def __init__(self):
        self.max_retries = 2
        self.timeout = 10

    def send_otp_email(self, recipient_email, otp_code):
        """Simplified OTP email sender with reduced spam triggers"""
        try:
            # Create plaintext message only (no HTML)
            message = f"""
Your SerenityQ verification code is: {otp_code}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.
"""
            msg = MIMEText(message)
            msg['Subject'] = 'Your SerenityQ Verification Code'
            msg['From'] = current_app.config['MAIL_DEFAULT_SENDER']
            msg['To'] = recipient_email
            
            # Simple SMTP connection
            with smtplib.SMTP(
                current_app.config['MAIL_SERVER'],
                current_app.config['MAIL_PORT'],
                timeout=self.timeout
            ) as server:
                if current_app.config.get('MAIL_USE_TLS', True):
                    server.starttls()
                server.login(
                    current_app.config['MAIL_USERNAME'],
                    current_app.config['MAIL_PASSWORD']
                )
                server.send_message(msg)
            
            current_app.logger.info(f"OTP sent to {recipient_email}")
            return True
            
        except Exception as e:
            current_app.logger.error(f"Email sending failed: {str(e)}")
            return False

# Simple instance creation
email_service = EmailService()
send_otp_email = email_service.send_otp_email