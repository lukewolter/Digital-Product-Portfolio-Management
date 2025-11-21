"""
User Management API Endpoints for Multi-Tenant System (Story 46)
These endpoints provide comprehensive user CRUD operations with RBAC, password reset, and audit logging.
"""
from fastapi import HTTPException, Depends
from typing import Optional
from datetime import datetime, timedelta
from app.models import (
    User, CreateUserRequest, UpdateUserRequest, 
    ResetPasswordRequest, ConfirmResetPasswordRequest, AdminResetPasswordRequest,
    ResetToken
)
from app.database import db
from app.rbac import require_admin, get_current_user, check_tenant_access, log_audit
from app.auth import hash_password, verify_password, generate_temp_password, generate_reset_token
from app.email_provider import email_provider


def register_user_management_endpoints(app):
    """Register all user management endpoints with the FastAPI app"""
    
    @app.post("/api/tenants/{tenant_id}/users")
    async def create_user(
        tenant_id: str,
        request: CreateUserRequest,
        current_user: User = Depends(require_admin)
    ) -> dict:
        """Create a new user in the tenant (admin only)"""
        if not check_tenant_access(current_user, tenant_id):
            raise HTTPException(status_code=403, detail="Access denied to this tenant")
        
        existing_user = db.get_user_by_email_and_tenant(request.email, tenant_id)
        if existing_user:
            raise HTTPException(status_code=409, detail="User with this email already exists in this tenant")
        
        if request.password:
            password = request.password
        else:
            password = generate_temp_password()
        
        new_user = User(
            email=request.email,
            name=request.name,
            hashed_password=hash_password(password),
            role=request.role,
            tenant_id=tenant_id,
            status="active",
            require_password_change=not request.password,
            token_version=0
        )
        
        created_user = db.create_user(new_user)
        
        tenant = db.get_tenant(tenant_id)
        if tenant:
            tenant.users.append(created_user.id)
            db.update_tenant(tenant_id, tenant)
        
        log_audit(tenant_id, current_user.id, "create", "user", created_user.id, {
            "email": request.email,
            "role": request.role,
            "auto_generated_password": not request.password
        })
        
        if not request.password:
            email_provider.send_welcome_email(request.email, password)
        else:
            email_provider.send_welcome_email(request.email)
        
        return {
            "id": created_user.id,
            "email": created_user.email,
            "name": created_user.name,
            "role": created_user.role,
            "status": created_user.status,
            "require_password_change": created_user.require_password_change,
            "temp_password": password if not request.password else None,
            "message": "User created successfully. Temporary password sent via email." if not request.password else "User created successfully."
        }
    
    
    @app.put("/api/tenants/{tenant_id}/users/{user_id}")
    async def update_user(
        tenant_id: str,
        user_id: str,
        request: UpdateUserRequest,
        current_user: User = Depends(require_admin)
    ) -> dict:
        """Update user details (admin only)"""
        if not check_tenant_access(current_user, tenant_id):
            raise HTTPException(status_code=403, detail="Access denied to this tenant")
        
        user = db.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if user.tenant_id != tenant_id:
            raise HTTPException(status_code=403, detail="User does not belong to this tenant")
        
        changes = {}
        
        if request.email and request.email != user.email:
            existing = db.get_user_by_email_and_tenant(request.email, tenant_id)
            if existing and existing.id != user_id:
                raise HTTPException(status_code=409, detail="Email already in use by another user in this tenant")
            user.email = request.email
            user.token_version += 1
            changes["email"] = request.email
        
        if request.role and request.role != user.role:
            if user.role == "admin" and request.role != "admin":
                admin_count = db.count_active_admins_in_tenant(tenant_id)
                if admin_count <= 1:
                    raise HTTPException(status_code=400, detail="Cannot demote the last admin in the tenant")
            user.role = request.role
            changes["role"] = request.role
        
        if request.name is not None:
            user.name = request.name
            changes["name"] = request.name
        
        updated_user = db.update_user(user_id, user)
        
        if changes:
            log_audit(tenant_id, current_user.id, "update", "user", user_id, changes)
        
        return {
            "id": updated_user.id,
            "email": updated_user.email,
            "name": updated_user.name,
            "role": updated_user.role,
            "status": updated_user.status,
            "message": "User updated successfully"
        }
    
    
    @app.delete("/api/tenants/{tenant_id}/users/{user_id}")
    async def delete_user(
        tenant_id: str,
        user_id: str,
        current_user: User = Depends(require_admin)
    ) -> dict:
        """Soft delete a user (admin only)"""
        if not check_tenant_access(current_user, tenant_id):
            raise HTTPException(status_code=403, detail="Access denied to this tenant")
        
        if user_id == current_user.id:
            raise HTTPException(status_code=400, detail="Cannot delete yourself")
        
        user = db.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if user.tenant_id != tenant_id:
            raise HTTPException(status_code=403, detail="User does not belong to this tenant")
        
        if user.role == "admin":
            admin_count = db.count_active_admins_in_tenant(tenant_id)
            if admin_count <= 1:
                raise HTTPException(status_code=400, detail="Cannot delete the last admin in the tenant")
        
        user.status = "inactive"
        user.deactivated_at = datetime.utcnow()
        user.deactivated_by = current_user.id
        user.token_version += 1
        
        db.update_user(user_id, user)
        
        log_audit(tenant_id, current_user.id, "delete", "user", user_id, {
            "email": user.email,
            "deactivated_at": user.deactivated_at.isoformat()
        })
        
        return {
            "message": "User deactivated successfully",
            "user_id": user_id,
            "status": "inactive"
        }
    
    
    @app.post("/api/tenants/{tenant_id}/users/{user_id}/admin-reset")
    async def admin_reset_password(
        tenant_id: str,
        user_id: str,
        current_user: User = Depends(require_admin)
    ) -> dict:
        """Admin-initiated password reset (generates temp password)"""
        if not check_tenant_access(current_user, tenant_id):
            raise HTTPException(status_code=403, detail="Access denied to this tenant")
        
        user = db.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if user.tenant_id != tenant_id:
            raise HTTPException(status_code=403, detail="User does not belong to this tenant")
        
        if user.status != "active":
            raise HTTPException(status_code=400, detail="Cannot reset password for inactive user")
        
        temp_password = generate_temp_password()
        user.hashed_password = hash_password(temp_password)
        user.require_password_change = True
        user.token_version += 1
        user.reset_token = None
        
        db.update_user(user_id, user)
        
        log_audit(tenant_id, current_user.id, "admin_reset_password", "user", user_id, {
            "reset_by": current_user.email
        })
        
        email_provider.send_temp_password_email(user.email, temp_password)
        
        return {
            "message": "Temporary password generated and sent to user",
            "temp_password": temp_password,
            "user_email": user.email,
            "require_password_change": True
        }
    
    
    @app.post("/api/users/reset-password")
    async def request_password_reset(request: ResetPasswordRequest) -> dict:
        """Request password reset (public endpoint, always returns 200)"""
        user = db.get_user_by_email(request.email)
        
        if user and user.status == "active":
            reset_token = generate_reset_token()
            expiry = datetime.utcnow() + timedelta(minutes=30)
            
            user.reset_token = ResetToken(token=reset_token, expiry=expiry)
            db.update_user(user.id, user)
            
            reset_url = f"https://product.lukewolter.com/reset-password?token={reset_token}"
            email_provider.send_password_reset_email(user.email, reset_token, reset_url)
            
            if user.tenant_id:
                log_audit(user.tenant_id, user.id, "request_password_reset", "user", user.id, {})
        
        return {
            "message": "If an account with that email exists, a password reset link has been sent."
        }
    
    
    @app.post("/api/users/reset-password/confirm")
    async def confirm_password_reset(request: ConfirmResetPasswordRequest) -> dict:
        """Confirm password reset with token"""
        for user in db.users.values():
            if user.reset_token and user.reset_token.token == request.token:
                if datetime.utcnow() > user.reset_token.expiry:
                    raise HTTPException(status_code=410, detail="Reset token has expired")
                
                if user.status != "active":
                    raise HTTPException(status_code=400, detail="User account is inactive")
                
                user.hashed_password = hash_password(request.new_password)
                user.reset_token = None
                user.token_version += 1
                user.require_password_change = False
                
                db.update_user(user.id, user)
                
                if user.tenant_id:
                    log_audit(user.tenant_id, user.id, "confirm_password_reset", "user", user.id, {})
                
                return {
                    "message": "Password reset successfully",
                    "email": user.email
                }
        
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    
    @app.get("/api/tenants/{tenant_id}/users")
    async def list_tenant_users(
        tenant_id: str,
        search: Optional[str] = None,
        role: Optional[str] = None,
        status: Optional[str] = None,
        include_inactive: bool = False,
        current_user: User = Depends(require_admin)
    ) -> list:
        """List all users in a tenant with optional filters (admin only)"""
        if not check_tenant_access(current_user, tenant_id):
            raise HTTPException(status_code=403, detail="Access denied to this tenant")
        
        users = db.get_users_by_tenant(tenant_id, include_inactive=include_inactive)
        
        if search:
            search_lower = search.lower()
            users = [u for u in users if search_lower in u.email.lower() or search_lower in u.name.lower()]
        
        if role:
            users = [u for u in users if u.role == role]
        
        if status:
            users = [u for u in users if u.status == status]
        
        return [
            {
                "id": u.id,
                "email": u.email,
                "name": u.name,
                "role": u.role,
                "status": u.status,
                "last_login": u.last_login.isoformat() if u.last_login else None,
                "created_at": u.created_at.isoformat(),
                "require_password_change": u.require_password_change,
                "deactivated_at": u.deactivated_at.isoformat() if u.deactivated_at else None
            }
            for u in users
        ]
