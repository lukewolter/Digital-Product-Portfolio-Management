"""
Authentication module for Firebase token verification.
For POC, we'll use a simple mock auth that doesn't require Firebase credentials.
In production, this would verify Firebase tokens.
"""
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

security = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security)
) -> dict:
    """
    Get current user from Firebase token.
    For POC, returns a test user without requiring Firebase setup.
    In production, this would verify the Firebase token and return user info.
    """
    
    if credentials:
        token = credentials.credentials
        if token.startswith("mock_"):
            user_id = token.replace("mock_", "")
            return {
                "uid": user_id,
                "email": f"user_{user_id}@example.com",
                "name": f"User {user_id}"
            }
    
    return {
        "uid": "test_user_123",
        "email": "test@example.com",
        "name": "Test User"
    }

async def get_current_user_required(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> dict:
    """
    Get current user with required authentication.
    Raises 401 if no valid credentials provided.
    """
    if not credentials:
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )
    
    user = await get_current_user(credentials)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials"
        )
    
    return user
