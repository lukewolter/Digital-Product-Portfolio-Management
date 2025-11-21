"""
Email provider abstraction for sending emails.
Currently logs to stdout for development. Replace with SMTP/SendGrid in production.
"""
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class EmailProvider:
    """Email provider interface"""
    
    def send_password_reset_email(self, to_email: str, reset_token: str, reset_url: str):
        """Send password reset email"""
        logger.info(f"""
========================================
PASSWORD RESET EMAIL
========================================
To: {to_email}
Reset Token: {reset_token}
Reset URL: {reset_url}
========================================
This is a development email provider. In production, configure SMTP/SendGrid.
========================================
        """)
        print(f"\n📧 Password reset email sent to {to_email}")
        print(f"   Reset URL: {reset_url}")
        print(f"   Token: {reset_token}\n")
    
    def send_temp_password_email(self, to_email: str, temp_password: str):
        """Send temporary password email (admin reset)"""
        logger.info(f"""
========================================
TEMPORARY PASSWORD EMAIL
========================================
To: {to_email}
Temporary Password: {temp_password}
========================================
This is a development email provider. In production, configure SMTP/SendGrid.
========================================
        """)
        print(f"\n📧 Temporary password email sent to {to_email}")
        print(f"   Temporary Password: {temp_password}")
        print(f"   ⚠️  User must change password on next login\n")
    
    def send_welcome_email(self, to_email: str, temp_password: Optional[str] = None):
        """Send welcome email to new user"""
        logger.info(f"""
========================================
WELCOME EMAIL
========================================
To: {to_email}
Temporary Password: {temp_password if temp_password else 'User will set their own password'}
========================================
This is a development email provider. In production, configure SMTP/SendGrid.
========================================
        """)
        print(f"\n📧 Welcome email sent to {to_email}")
        if temp_password:
            print(f"   Temporary Password: {temp_password}")
            print(f"   ⚠️  User must change password on first login\n")

email_provider = EmailProvider()
