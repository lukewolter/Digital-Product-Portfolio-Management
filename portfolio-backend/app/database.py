"""
In-memory database for Portfolio Management v3.0
Data will be lost on server restart - this is a proof of concept
"""
from typing import Dict, List, Optional
from app.models import (
    User, Portfolio, Notification, 
    Idea, CapacityResource, CustomReport, Whiteboard, Integration,
    Tenant, AuditLog, Workspace,
    ContractTemplate, OperatingModel, SLA, CLMIntegration, ComplianceIssue, ArtifactAudit
)
from datetime import datetime

class InMemoryDB:
    def __init__(self):
        self.users: Dict[str, User] = {}
        self.portfolios: Dict[str, Portfolio] = {}
        self.notifications: Dict[str, Notification] = {}
        
        self.ideas: Dict[str, Idea] = {}
        self.capacity_resources: Dict[str, CapacityResource] = {}
        self.reports: Dict[str, CustomReport] = {}
        self.whiteboards: Dict[str, Whiteboard] = {}
        self.integrations: Dict[str, Integration] = {}
        
        self.tenants: Dict[str, Tenant] = {}
        self.audit_logs: Dict[str, AuditLog] = {}
        self.workspaces: Dict[str, Workspace] = {}
        
        self.templates: Dict[str, ContractTemplate] = {}
        self.operating_models: Dict[str, OperatingModel] = {}
        self.slas: Dict[str, SLA] = {}
        self.clm_integrations: Dict[str, CLMIntegration] = {}
        self.compliance_issues: Dict[str, ComplianceIssue] = {}
        self.artifact_audits: Dict[str, ArtifactAudit] = {}
        
        self._init_mock_data()
    
    def _init_mock_data(self):
        """Initialize with mock data for testing"""
        import os
        from app.auth import hash_password
        
        test_tenant = Tenant(
            id="test-tenant-1",
            company_name="Demo Company",
            users=[],
            portfolios=[]
        )
        self.tenants[test_tenant.id] = test_tenant
        
        admin_email = os.getenv("ADMIN_EMAIL", "admin@demo.local")
        admin_password = os.getenv("ADMIN_PASSWORD", "Admin123!")
        admin_name = os.getenv("ADMIN_NAME", "Admin User")
        
        admin_user = User(
            id="admin-user-1",
            email=admin_email,
            name=admin_name,
            hashed_password=hash_password(admin_password),
            firebase_uid=None,
            portfolios=[],
            role="admin",
            tenant_id="test-tenant-1"
        )
        self.users[admin_user.id] = admin_user
        test_tenant.users.append(admin_user.id)
        
        if admin_email == "admin@demo.local":
            print("⚠️  WARNING: Using default admin credentials!")
            print(f"   Email: {admin_email}")
            print(f"   Password: {admin_password}")
            print("   Please change these credentials in production!")
    
    def get_user_by_firebase_uid(self, firebase_uid: str) -> Optional[User]:
        return self.users.get(firebase_uid)
    
    def get_user_by_id(self, user_id: str) -> Optional[User]:
        return self.users.get(user_id)
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email address"""
        for user in self.users.values():
            if user.email == email:
                return user
        return None
    
    def create_user(self, user: User) -> User:
        self.users[user.id] = user
        if user.firebase_uid:
            self.users[user.firebase_uid] = user  # Also index by firebase_uid
        return user
    
    def update_user(self, user_id: str, user: User) -> Optional[User]:
        if user_id in self.users:
            self.users[user_id] = user
            if user.firebase_uid:
                self.users[user.firebase_uid] = user
            return user
        return None
    
    def get_portfolio(self, portfolio_id: str) -> Optional[Portfolio]:
        return self.portfolios.get(portfolio_id)
    
    def get_portfolios_by_user(self, user_id: str) -> List[Portfolio]:
        return [
            p for p in self.portfolios.values()
            if p.owner_id == user_id or user_id in p.collaborators
        ]
    
    def create_portfolio(self, portfolio: Portfolio) -> Portfolio:
        portfolio.updated_at = datetime.utcnow()
        self.portfolios[portfolio.id] = portfolio
        
        user = self.get_user_by_id(portfolio.owner_id)
        if user and portfolio.id not in user.portfolios:
            user.portfolios.append(portfolio.id)
        
        return portfolio
    
    def update_portfolio(self, portfolio_id: str, portfolio: Portfolio) -> Optional[Portfolio]:
        if portfolio_id in self.portfolios:
            portfolio.updated_at = datetime.utcnow()
            self.portfolios[portfolio_id] = portfolio
            return portfolio
        return None
    
    def delete_portfolio(self, portfolio_id: str) -> bool:
        if portfolio_id in self.portfolios:
            portfolio = self.portfolios[portfolio_id]
            
            user = self.get_user_by_id(portfolio.owner_id)
            if user and portfolio_id in user.portfolios:
                user.portfolios.remove(portfolio_id)
            
            del self.portfolios[portfolio_id]
            return True
        return False
    
    def get_notifications_by_user(self, user_id: str) -> List[Notification]:
        return [
            n for n in self.notifications.values()
            if n.user_id == user_id
        ]
    
    def create_notification(self, notification: Notification) -> Notification:
        self.notifications[notification.id] = notification
        return notification
    
    def update_notification(self, notification_id: str, notification: Notification) -> Optional[Notification]:
        if notification_id in self.notifications:
            self.notifications[notification_id] = notification
            return notification
        return None
    
    def delete_notification(self, notification_id: str) -> bool:
        if notification_id in self.notifications:
            del self.notifications[notification_id]
            return True
        return False
    
    def get_ideas_by_portfolio(self, portfolio_id: str) -> List[Idea]:
        return [i for i in self.ideas.values() if i.portfolio_id == portfolio_id]
    
    def get_idea(self, idea_id: str) -> Optional[Idea]:
        return self.ideas.get(idea_id)
    
    def create_idea(self, idea: Idea) -> Idea:
        self.ideas[idea.id] = idea
        return idea
    
    def update_idea(self, idea_id: str, idea: Idea) -> Optional[Idea]:
        if idea_id in self.ideas:
            idea.updated_at = datetime.utcnow()
            self.ideas[idea_id] = idea
            return idea
        return None
    
    def delete_idea(self, idea_id: str) -> bool:
        if idea_id in self.ideas:
            del self.ideas[idea_id]
            return True
        return False
    
    def get_capacity_resources_by_portfolio(self, portfolio_id: str) -> List[CapacityResource]:
        return [r for r in self.capacity_resources.values() if r.portfolio_id == portfolio_id]
    
    def get_capacity_resource(self, resource_id: str) -> Optional[CapacityResource]:
        return self.capacity_resources.get(resource_id)
    
    def create_capacity_resource(self, resource: CapacityResource) -> CapacityResource:
        self.capacity_resources[resource.id] = resource
        return resource
    
    def update_capacity_resource(self, resource_id: str, resource: CapacityResource) -> Optional[CapacityResource]:
        if resource_id in self.capacity_resources:
            self.capacity_resources[resource_id] = resource
            return resource
        return None
    
    def delete_capacity_resource(self, resource_id: str) -> bool:
        if resource_id in self.capacity_resources:
            del self.capacity_resources[resource_id]
            return True
        return False
    
    def get_reports_by_portfolio(self, portfolio_id: str) -> List[CustomReport]:
        return [r for r in self.reports.values() if r.portfolio_id == portfolio_id]
    
    def get_report(self, report_id: str) -> Optional[CustomReport]:
        return self.reports.get(report_id)
    
    def create_report(self, report: CustomReport) -> CustomReport:
        self.reports[report.id] = report
        return report
    
    def update_report(self, report_id: str, report: CustomReport) -> Optional[CustomReport]:
        if report_id in self.reports:
            self.reports[report_id] = report
            return report
        return None
    
    def delete_report(self, report_id: str) -> bool:
        if report_id in self.reports:
            del self.reports[report_id]
            return True
        return False
    
    def get_whiteboards_by_portfolio(self, portfolio_id: str) -> List[Whiteboard]:
        return [w for w in self.whiteboards.values() if w.portfolio_id == portfolio_id]
    
    def get_whiteboard(self, whiteboard_id: str) -> Optional[Whiteboard]:
        return self.whiteboards.get(whiteboard_id)
    
    def create_whiteboard(self, whiteboard: Whiteboard) -> Whiteboard:
        self.whiteboards[whiteboard.id] = whiteboard
        return whiteboard
    
    def update_whiteboard(self, whiteboard_id: str, whiteboard: Whiteboard) -> Optional[Whiteboard]:
        if whiteboard_id in self.whiteboards:
            whiteboard.updated_at = datetime.utcnow()
            self.whiteboards[whiteboard_id] = whiteboard
            return whiteboard
        return None
    
    def delete_whiteboard(self, whiteboard_id: str) -> bool:
        if whiteboard_id in self.whiteboards:
            del self.whiteboards[whiteboard_id]
            return True
        return False
    
    def get_integrations_by_portfolio(self, portfolio_id: str) -> List[Integration]:
        return [i for i in self.integrations.values() if i.portfolio_id == portfolio_id]
    
    def get_integration(self, integration_id: str) -> Optional[Integration]:
        return self.integrations.get(integration_id)
    
    def create_integration(self, integration: Integration) -> Integration:
        self.integrations[integration.id] = integration
        return integration
    
    def update_integration(self, integration_id: str, integration: Integration) -> Optional[Integration]:
        if integration_id in self.integrations:
            self.integrations[integration_id] = integration
            return integration
        return None
    
    def delete_integration(self, integration_id: str) -> bool:
        if integration_id in self.integrations:
            del self.integrations[integration_id]
            return True
        return False
    
    def get_tenant(self, tenant_id: str) -> Optional[Tenant]:
        return self.tenants.get(tenant_id)
    
    def get_all_tenants(self) -> List[Tenant]:
        return list(self.tenants.values())
    
    def create_tenant(self, tenant: Tenant) -> Tenant:
        self.tenants[tenant.id] = tenant
        return tenant
    
    def update_tenant(self, tenant_id: str, tenant: Tenant) -> Optional[Tenant]:
        if tenant_id in self.tenants:
            tenant.updated_at = datetime.utcnow()
            self.tenants[tenant_id] = tenant
            return tenant
        return None
    
    def delete_tenant(self, tenant_id: str) -> bool:
        if tenant_id in self.tenants:
            del self.tenants[tenant_id]
            return True
        return False
    
    def get_users_by_tenant(self, tenant_id: str, include_inactive: bool = False) -> List[User]:
        """Get users by tenant, optionally including inactive users"""
        users = [u for u in self.users.values() if u.tenant_id == tenant_id]
        if not include_inactive:
            users = [u for u in users if u.status == "active"]
        return users
    
    def get_user_by_email_and_tenant(self, email: str, tenant_id: str) -> Optional[User]:
        """Get user by email within a specific tenant"""
        for user in self.users.values():
            if user.email == email and user.tenant_id == tenant_id:
                return user
        return None
    
    def delete_user(self, user_id: str) -> bool:
        """Hard delete user (for cleanup only, use soft delete in production)"""
        if user_id in self.users:
            del self.users[user_id]
            return True
        return False
    
    def count_active_admins_in_tenant(self, tenant_id: str) -> int:
        """Count active admin users in a tenant"""
        return len([
            u for u in self.users.values() 
            if u.tenant_id == tenant_id and u.role == "admin" and u.status == "active"
        ])
    
    def get_portfolios_by_tenant(self, tenant_id: str) -> List[Portfolio]:
        return [p for p in self.portfolios.values() if p.tenant_id == tenant_id]
    
    def create_audit_log(self, log: AuditLog) -> AuditLog:
        self.audit_logs[log.id] = log
        return log
    
    def get_audit_logs_by_tenant(self, tenant_id: str, limit: int = 100) -> List[AuditLog]:
        logs = [l for l in self.audit_logs.values() if l.tenant_id == tenant_id]
        logs.sort(key=lambda x: x.timestamp, reverse=True)
        return logs[:limit]
    
    def get_workspace(self, workspace_id: str) -> Optional[Workspace]:
        return self.workspaces.get(workspace_id)
    
    def get_workspaces_by_tenant(self, tenant_id: str) -> List[Workspace]:
        return [w for w in self.workspaces.values() if w.tenant_id == tenant_id]
    
    def create_workspace(self, workspace: Workspace) -> Workspace:
        self.workspaces[workspace.id] = workspace
        return workspace
    
    def update_workspace(self, workspace_id: str, workspace: Workspace) -> Optional[Workspace]:
        if workspace_id in self.workspaces:
            workspace.updated_at = datetime.utcnow()
            self.workspaces[workspace_id] = workspace
            return workspace
        return None
    
    def delete_workspace(self, workspace_id: str) -> bool:
        if workspace_id in self.workspaces:
            del self.workspaces[workspace_id]
            return True
        return False
    
    def get_template(self, template_id: str) -> Optional[ContractTemplate]:
        return self.templates.get(template_id)
    
    def get_templates_by_tenant(self, tenant_id: str, template_type: Optional[str] = None, status: Optional[str] = None) -> List[ContractTemplate]:
        templates = [t for t in self.templates.values() if t.tenant_id == tenant_id]
        if template_type:
            templates = [t for t in templates if t.type == template_type]
        if status:
            templates = [t for t in templates if t.status == status]
        return templates
    
    def create_template(self, template: ContractTemplate) -> ContractTemplate:
        self.templates[template.id] = template
        return template
    
    def update_template(self, template_id: str, template: ContractTemplate) -> Optional[ContractTemplate]:
        if template_id in self.templates:
            template.updated_at = datetime.utcnow()
            self.templates[template_id] = template
            return template
        return None
    
    def delete_template(self, template_id: str) -> bool:
        if template_id in self.templates:
            del self.templates[template_id]
            return True
        return False
    
    def get_operating_model(self, model_id: str) -> Optional[OperatingModel]:
        return self.operating_models.get(model_id)
    
    def get_operating_models_by_portfolio(self, portfolio_id: str) -> List[OperatingModel]:
        return [m for m in self.operating_models.values() if m.portfolio_id == portfolio_id]
    
    def get_operating_models_by_tenant(self, tenant_id: str) -> List[OperatingModel]:
        return [m for m in self.operating_models.values() if m.tenant_id == tenant_id]
    
    def create_operating_model(self, model: OperatingModel) -> OperatingModel:
        self.operating_models[model.id] = model
        return model
    
    def update_operating_model(self, model_id: str, model: OperatingModel) -> Optional[OperatingModel]:
        if model_id in self.operating_models:
            model.updated_at = datetime.utcnow()
            self.operating_models[model_id] = model
            return model
        return None
    
    def delete_operating_model(self, model_id: str) -> bool:
        if model_id in self.operating_models:
            del self.operating_models[model_id]
            return True
        return False
    
    def get_sla(self, sla_id: str) -> Optional[SLA]:
        return self.slas.get(sla_id)
    
    def get_slas_by_tenant(self, tenant_id: str, status: Optional[str] = None) -> List[SLA]:
        slas = [s for s in self.slas.values() if s.tenant_id == tenant_id]
        if status:
            slas = [s for s in slas if s.status == status]
        return slas
    
    def get_slas_by_portfolio(self, portfolio_id: str) -> List[SLA]:
        return [s for s in self.slas.values() if s.portfolio_id == portfolio_id]
    
    def create_sla(self, sla: SLA) -> SLA:
        self.slas[sla.id] = sla
        return sla
    
    def update_sla(self, sla_id: str, sla: SLA) -> Optional[SLA]:
        if sla_id in self.slas:
            sla.updated_at = datetime.utcnow()
            self.slas[sla_id] = sla
            return sla
        return None
    
    def delete_sla(self, sla_id: str) -> bool:
        if sla_id in self.slas:
            del self.slas[sla_id]
            return True
        return False
    
    def get_clm_integration(self, integration_id: str) -> Optional[CLMIntegration]:
        return self.clm_integrations.get(integration_id)
    
    def get_clm_integrations_by_tenant(self, tenant_id: str, tool: Optional[str] = None) -> List[CLMIntegration]:
        integrations = [i for i in self.clm_integrations.values() if i.tenant_id == tenant_id]
        if tool:
            integrations = [i for i in integrations if i.tool == tool]
        return integrations
    
    def create_clm_integration(self, integration: CLMIntegration) -> CLMIntegration:
        self.clm_integrations[integration.id] = integration
        return integration
    
    def update_clm_integration(self, integration_id: str, integration: CLMIntegration) -> Optional[CLMIntegration]:
        if integration_id in self.clm_integrations:
            integration.updated_at = datetime.utcnow()
            self.clm_integrations[integration_id] = integration
            return integration
        return None
    
    def delete_clm_integration(self, integration_id: str) -> bool:
        if integration_id in self.clm_integrations:
            del self.clm_integrations[integration_id]
            return True
        return False
    
    def get_compliance_issue(self, issue_id: str) -> Optional[ComplianceIssue]:
        return self.compliance_issues.get(issue_id)
    
    def get_compliance_issues_by_artifact(self, artifact_type: str, artifact_id: str, resolved: Optional[bool] = None) -> List[ComplianceIssue]:
        issues = [i for i in self.compliance_issues.values() 
                 if i.artifact_type == artifact_type and i.artifact_id == artifact_id]
        if resolved is not None:
            issues = [i for i in issues if i.resolved == resolved]
        return issues
    
    def create_compliance_issue(self, issue: ComplianceIssue) -> ComplianceIssue:
        self.compliance_issues[issue.id] = issue
        return issue
    
    def update_compliance_issue(self, issue_id: str, issue: ComplianceIssue) -> Optional[ComplianceIssue]:
        if issue_id in self.compliance_issues:
            self.compliance_issues[issue_id] = issue
            return issue
        return None
    
    def create_artifact_audit(self, audit: ArtifactAudit) -> ArtifactAudit:
        self.artifact_audits[audit.id] = audit
        return audit
    
    def get_artifact_audits_by_tenant(self, tenant_id: str, artifact_type: Optional[str] = None) -> List[ArtifactAudit]:
        audits = [a for a in self.artifact_audits.values() if a.tenant_id == tenant_id]
        if artifact_type:
            audits = [a for a in audits if a.artifact_type == artifact_type]
        return sorted(audits, key=lambda x: x.timestamp, reverse=True)
    
    def get_artifact_audits_by_artifact(self, artifact_type: str, artifact_id: str) -> List[ArtifactAudit]:
        audits = [a for a in self.artifact_audits.values() 
                 if a.artifact_type == artifact_type and a.artifact_id == artifact_id]
        return sorted(audits, key=lambda x: x.timestamp, reverse=True)

db = InMemoryDB()
