"""
Role-Based Access Control (RBAC) middleware and helpers
"""
from fastapi import HTTPException, Depends, Request
from typing import Optional
from app.models import User, AuditLog
from app.database import db
from app.auth import get_current_user_from_token
from datetime import datetime

async def get_current_user(request: Request) -> User:
    """
    Get current user from JWT token (cookie or header)
    """
    return await get_current_user_from_token(request)

async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Require admin role for endpoint access
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

def check_tenant_access(user: User, resource_tenant_id: Optional[str]) -> bool:
    """
    Check if user has access to resource based on tenant
    """
    if user.role == "admin" and user.tenant_id == resource_tenant_id:
        return True
    if user.tenant_id == resource_tenant_id:
        return True
    return False

def check_portfolio_access(user: User, portfolio) -> bool:
    """
    Check if user has access to portfolio
    """
    if not check_tenant_access(user, portfolio.tenant_id):
        return False
    if portfolio.owner_id == user.id or user.id in portfolio.collaborators:
        return True
    return False

def log_audit(tenant_id: str, user_id: str, action: str, resource_type: str, 
              resource_id: str, details: dict = None):
    """
    Create audit log entry
    """
    audit_log = AuditLog(
        tenant_id=tenant_id,
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details or {},
        timestamp=datetime.utcnow()
    )
    db.create_audit_log(audit_log)
    return audit_log
