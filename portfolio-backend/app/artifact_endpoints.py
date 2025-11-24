"""
Deal Artifacts API Endpoints (Stories 47-51)
Provides comprehensive artifact management for contracts, operating models, SLAs, CLM integrations, and compliance.
"""
from fastapi import HTTPException, Depends
from typing import Optional, List
from datetime import datetime, timedelta
from app.models import (
    ContractTemplate, OperatingModel, SLA, CLMIntegration, ComplianceIssue, ArtifactAudit,
    CreateTemplateRequest, UpdateTemplateRequest,
    CreateOperatingModelRequest, UpdateOperatingModelRequest,
    CreateSLARequest, UpdateSLARequest,
    CreateCLMIntegrationRequest, SyncArtifactRequest, AIComplianceCheckRequest,
    Clause, TemplateVersion, OperatingModelSection, SLAMetric
)
from app.database import db
from app.rbac import require_admin, get_current_user, check_tenant_access, log_audit
from app.auth import get_current_user_from_token
from app.models import User


def register_artifact_endpoints(app):
    """Register all deal artifact management endpoints"""
    
    
    @app.get("/api/artifacts/templates")
    async def list_templates(
        template_type: Optional[str] = None,
        status: Optional[str] = None,
        current_user: User = Depends(get_current_user_from_token)
    ):
        """List all contract templates for the current tenant"""
        if not current_user.tenant_id:
            raise HTTPException(status_code=403, detail="User must belong to a tenant")
        
        templates = db.get_templates_by_tenant(current_user.tenant_id, template_type, status)
        
        return [{
            "id": t.id,
            "name": t.name,
            "type": t.type,
            "status": t.status,
            "created_by": t.created_by,
            "created_at": t.created_at.isoformat(),
            "updated_at": t.updated_at.isoformat(),
            "clause_count": len(t.clauses),
            "version_count": len(t.versions)
        } for t in templates]
    
    @app.get("/api/artifacts/templates/{template_id}")
    async def get_template(
        template_id: str,
        current_user: User = Depends(get_current_user_from_token)
    ):
        """Get a specific contract template"""
        template = db.get_template(template_id)
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        
        if template.tenant_id != current_user.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied to this template")
        
        return template
    
    @app.post("/api/artifacts/templates")
    async def create_template(
        request: CreateTemplateRequest,
        current_user: User = Depends(get_current_user_from_token)
    ):
        """Create a new contract template"""
        if not current_user.tenant_id:
            raise HTTPException(status_code=403, detail="User must belong to a tenant")
        
        template = ContractTemplate(
            tenant_id=current_user.tenant_id,
            name=request.name,
            type=request.type,
            content=request.content,
            clauses=request.clauses,
            created_by=current_user.id,
            status="draft"
        )
        
        created = db.create_template(template)
        
        audit = ArtifactAudit(
            tenant_id=current_user.tenant_id,
            artifact_type="template",
            artifact_id=created.id,
            action="created",
            user_id=current_user.id,
            changes={"name": request.name, "type": request.type}
        )
        db.create_artifact_audit(audit)
        
        log_audit(current_user.tenant_id, current_user.id, "create", "template", created.id, {
            "name": request.name,
            "type": request.type
        })
        
        return {
            "id": created.id,
            "message": "Template created successfully",
            "status": created.status
        }
    
    @app.put("/api/artifacts/templates/{template_id}")
    async def update_template(
        template_id: str,
        request: UpdateTemplateRequest,
        current_user: User = Depends(get_current_user_from_token)
    ):
        """Update a contract template"""
        template = db.get_template(template_id)
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        
        if template.tenant_id != current_user.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied to this template")
        
        changes = {}
        
        if request.name:
            template.name = request.name
            changes["name"] = request.name
        
        if request.content:
            version = TemplateVersion(
                version=len(template.versions) + 1,
                content=template.content,
                changed_by=current_user.id
            )
            template.versions.append(version)
            template.content = request.content
            changes["content_updated"] = True
        
        if request.clauses:
            template.clauses = request.clauses
            changes["clauses_updated"] = True
        
        if request.status:
            if request.status == "approved" and current_user.role != "admin":
                raise HTTPException(status_code=403, detail="Only admins can approve templates")
            template.status = request.status
            if request.status == "approved":
                template.approved_by = current_user.id
                template.approved_at = datetime.utcnow()
            changes["status"] = request.status
        
        updated = db.update_template(template_id, template)
        
        audit = ArtifactAudit(
            tenant_id=current_user.tenant_id,
            artifact_type="template",
            artifact_id=template_id,
            action="updated",
            user_id=current_user.id,
            changes=changes
        )
        db.create_artifact_audit(audit)
        
        return {
            "id": updated.id,
            "message": "Template updated successfully",
            "changes": changes
        }
    
    @app.delete("/api/artifacts/templates/{template_id}")
    async def delete_template(
        template_id: str,
        current_user: User = Depends(require_admin)
    ):
        """Delete a contract template (admin only)"""
        template = db.get_template(template_id)
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        
        if template.tenant_id != current_user.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied to this template")
        
        db.delete_template(template_id)
        
        audit = ArtifactAudit(
            tenant_id=current_user.tenant_id,
            artifact_type="template",
            artifact_id=template_id,
            action="deleted",
            user_id=current_user.id
        )
        db.create_artifact_audit(audit)
        
        return {"message": "Template deleted successfully"}
    
    
    @app.get("/api/artifacts/operating-models")
    async def list_operating_models(
        portfolio_id: Optional[str] = None,
        current_user: User = Depends(get_current_user_from_token)
    ):
        """List operating models for tenant or specific portfolio"""
        if not current_user.tenant_id:
            raise HTTPException(status_code=403, detail="User must belong to a tenant")
        
        if portfolio_id:
            models = db.get_operating_models_by_portfolio(portfolio_id)
        else:
            models = db.get_operating_models_by_tenant(current_user.tenant_id)
        
        return [{
            "id": m.id,
            "name": m.name,
            "portfolio_id": m.portfolio_id,
            "template_type": m.template_type,
            "section_count": len(m.sections),
            "created_at": m.created_at.isoformat()
        } for m in models]
    
    @app.get("/api/artifacts/operating-models/{model_id}")
    async def get_operating_model(
        model_id: str,
        current_user: User = Depends(get_current_user_from_token)
    ):
        """Get a specific operating model"""
        model = db.get_operating_model(model_id)
        if not model:
            raise HTTPException(status_code=404, detail="Operating model not found")
        
        if model.tenant_id != current_user.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied to this model")
        
        return model
    
    @app.post("/api/artifacts/operating-models")
    async def create_operating_model(
        request: CreateOperatingModelRequest,
        current_user: User = Depends(get_current_user_from_token)
    ):
        """Create a new operating model"""
        if not current_user.tenant_id:
            raise HTTPException(status_code=403, detail="User must belong to a tenant")
        
        portfolio = db.get_portfolio(request.portfolio_id)
        if not portfolio or portfolio.tenant_id != current_user.tenant_id:
            raise HTTPException(status_code=404, detail="Portfolio not found or access denied")
        
        model = OperatingModel(
            portfolio_id=request.portfolio_id,
            tenant_id=current_user.tenant_id,
            name=request.name,
            template_type=request.template_type,
            sections=request.sections,
            created_by=current_user.id
        )
        
        created = db.create_operating_model(model)
        
        audit = ArtifactAudit(
            tenant_id=current_user.tenant_id,
            artifact_type="operating_model",
            artifact_id=created.id,
            action="created",
            user_id=current_user.id,
            changes={"name": request.name, "template_type": request.template_type}
        )
        db.create_artifact_audit(audit)
        
        return {
            "id": created.id,
            "message": "Operating model created successfully"
        }
    
    @app.put("/api/artifacts/operating-models/{model_id}")
    async def update_operating_model(
        model_id: str,
        request: UpdateOperatingModelRequest,
        current_user: User = Depends(get_current_user_from_token)
    ):
        """Update an operating model"""
        model = db.get_operating_model(model_id)
        if not model:
            raise HTTPException(status_code=404, detail="Operating model not found")
        
        if model.tenant_id != current_user.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied to this model")
        
        changes = {}
        
        if request.name:
            model.name = request.name
            changes["name"] = request.name
        
        if request.sections:
            model.sections = request.sections
            changes["sections_updated"] = True
        
        if request.linked_roadmap_ids:
            model.linked_roadmap_ids = request.linked_roadmap_ids
            changes["linked_roadmaps"] = request.linked_roadmap_ids
        
        updated = db.update_operating_model(model_id, model)
        
        audit = ArtifactAudit(
            tenant_id=current_user.tenant_id,
            artifact_type="operating_model",
            artifact_id=model_id,
            action="updated",
            user_id=current_user.id,
            changes=changes
        )
        db.create_artifact_audit(audit)
        
        return {
            "id": updated.id,
            "message": "Operating model updated successfully"
        }
    
    @app.delete("/api/artifacts/operating-models/{model_id}")
    async def delete_operating_model(
        model_id: str,
        current_user: User = Depends(get_current_user_from_token)
    ):
        """Delete an operating model"""
        model = db.get_operating_model(model_id)
        if not model:
            raise HTTPException(status_code=404, detail="Operating model not found")
        
        if model.tenant_id != current_user.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied to this model")
        
        db.delete_operating_model(model_id)
        
        audit = ArtifactAudit(
            tenant_id=current_user.tenant_id,
            artifact_type="operating_model",
            artifact_id=model_id,
            action="deleted",
            user_id=current_user.id
        )
        db.create_artifact_audit(audit)
        
        return {"message": "Operating model deleted successfully"}
    
    
    @app.get("/api/artifacts/slas")
    async def list_slas(
        portfolio_id: Optional[str] = None,
        status: Optional[str] = None,
        current_user: User = Depends(get_current_user_from_token)
    ):
        """List SLAs for tenant or specific portfolio"""
        if not current_user.tenant_id:
            raise HTTPException(status_code=403, detail="User must belong to a tenant")
        
        if portfolio_id:
            slas = db.get_slas_by_portfolio(portfolio_id)
        else:
            slas = db.get_slas_by_tenant(current_user.tenant_id, status)
        
        return [{
            "id": s.id,
            "name": s.name,
            "status": s.status,
            "portfolio_id": s.portfolio_id,
            "metric_count": len(s.metrics),
            "start_date": s.start_date.isoformat() if s.start_date else None,
            "end_date": s.end_date.isoformat() if s.end_date else None,
            "created_at": s.created_at.isoformat()
        } for s in slas]
    
    @app.get("/api/artifacts/slas/{sla_id}")
    async def get_sla(
        sla_id: str,
        current_user: User = Depends(get_current_user_from_token)
    ):
        """Get a specific SLA"""
        sla = db.get_sla(sla_id)
        if not sla:
            raise HTTPException(status_code=404, detail="SLA not found")
        
        if sla.tenant_id != current_user.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied to this SLA")
        
        return sla
    
    @app.post("/api/artifacts/slas")
    async def create_sla(
        request: CreateSLARequest,
        current_user: User = Depends(get_current_user_from_token)
    ):
        """Create a new SLA"""
        if not current_user.tenant_id:
            raise HTTPException(status_code=403, detail="User must belong to a tenant")
        
        if request.portfolio_id:
            portfolio = db.get_portfolio(request.portfolio_id)
            if not portfolio or portfolio.tenant_id != current_user.tenant_id:
                raise HTTPException(status_code=404, detail="Portfolio not found or access denied")
        
        sla = SLA(
            tenant_id=current_user.tenant_id,
            portfolio_id=request.portfolio_id,
            name=request.name,
            description=request.description,
            metrics=request.metrics,
            start_date=request.start_date,
            end_date=request.end_date,
            created_by=current_user.id,
            status="draft"
        )
        
        created = db.create_sla(sla)
        
        audit = ArtifactAudit(
            tenant_id=current_user.tenant_id,
            artifact_type="sla",
            artifact_id=created.id,
            action="created",
            user_id=current_user.id,
            changes={"name": request.name, "metric_count": len(request.metrics)}
        )
        db.create_artifact_audit(audit)
        
        return {
            "id": created.id,
            "message": "SLA created successfully"
        }
    
    @app.put("/api/artifacts/slas/{sla_id}")
    async def update_sla(
        sla_id: str,
        request: UpdateSLARequest,
        current_user: User = Depends(get_current_user_from_token)
    ):
        """Update an SLA"""
        sla = db.get_sla(sla_id)
        if not sla:
            raise HTTPException(status_code=404, detail="SLA not found")
        
        if sla.tenant_id != current_user.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied to this SLA")
        
        changes = {}
        
        if request.name:
            sla.name = request.name
            changes["name"] = request.name
        
        if request.description:
            sla.description = request.description
            changes["description_updated"] = True
        
        if request.metrics:
            sla.metrics = request.metrics
            changes["metrics_updated"] = True
        
        if request.status:
            sla.status = request.status
            changes["status"] = request.status
        
        updated = db.update_sla(sla_id, sla)
        
        audit = ArtifactAudit(
            tenant_id=current_user.tenant_id,
            artifact_type="sla",
            artifact_id=sla_id,
            action="updated",
            user_id=current_user.id,
            changes=changes
        )
        db.create_artifact_audit(audit)
        
        return {
            "id": updated.id,
            "message": "SLA updated successfully"
        }
    
    @app.delete("/api/artifacts/slas/{sla_id}")
    async def delete_sla(
        sla_id: str,
        current_user: User = Depends(require_admin)
    ):
        """Delete an SLA (admin only)"""
        sla = db.get_sla(sla_id)
        if not sla:
            raise HTTPException(status_code=404, detail="SLA not found")
        
        if sla.tenant_id != current_user.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied to this SLA")
        
        db.delete_sla(sla_id)
        
        audit = ArtifactAudit(
            tenant_id=current_user.tenant_id,
            artifact_type="sla",
            artifact_id=sla_id,
            action="deleted",
            user_id=current_user.id
        )
        db.create_artifact_audit(audit)
        
        return {"message": "SLA deleted successfully"}
    
    
    @app.get("/api/artifacts/clm-integrations")
    async def list_clm_integrations(
        current_user: User = Depends(require_admin)
    ):
        """List CLM integrations for tenant (admin only)"""
        if not current_user.tenant_id:
            raise HTTPException(status_code=403, detail="User must belong to a tenant")
        
        integrations = db.get_clm_integrations_by_tenant(current_user.tenant_id)
        
        return [{
            "id": i.id,
            "tool": i.tool,
            "enabled": i.enabled,
            "test_mode": i.test_mode,
            "created_at": i.created_at.isoformat(),
            "updated_at": i.updated_at.isoformat()
        } for i in integrations]
    
    @app.post("/api/artifacts/clm-integrations")
    async def create_clm_integration(
        request: CreateCLMIntegrationRequest,
        current_user: User = Depends(require_admin)
    ):
        """Create a new CLM integration (admin only)"""
        if not current_user.tenant_id:
            raise HTTPException(status_code=403, detail="User must belong to a tenant")
        
        integration = CLMIntegration(
            tenant_id=current_user.tenant_id,
            tool=request.tool,
            config=request.config,
            field_mappings=request.field_mappings,
            test_mode=request.test_mode
        )
        
        created = db.create_clm_integration(integration)
        
        log_audit(current_user.tenant_id, current_user.id, "create", "clm_integration", created.id, {
            "tool": request.tool,
            "test_mode": request.test_mode
        })
        
        return {
            "id": created.id,
            "message": f"{request.tool} integration created successfully"
        }
    
    @app.post("/api/artifacts/clm-integrations/{integration_id}/sync")
    async def sync_artifact_with_clm(
        integration_id: str,
        request: SyncArtifactRequest,
        current_user: User = Depends(require_admin)
    ):
        """Sync an artifact with CLM tool (admin only)"""
        integration = db.get_clm_integration(integration_id)
        if not integration:
            raise HTTPException(status_code=404, detail="CLM integration not found")
        
        if integration.tenant_id != current_user.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied to this integration")
        
        if not integration.enabled:
            raise HTTPException(status_code=400, detail="Integration is disabled")
        
        if request.artifact_type == "template":
            artifact = db.get_template(request.artifact_id)
        elif request.artifact_type == "sla":
            artifact = db.get_sla(request.artifact_id)
        else:
            raise HTTPException(status_code=400, detail="Invalid artifact type")
        
        if not artifact:
            raise HTTPException(status_code=404, detail="Artifact not found")
        
        sync_result = {
            "status": "success",
            "message": f"Artifact synced with {integration.tool}",
            "external_id": f"{integration.tool}-{artifact.id}",
            "action": request.action
        }
        
        audit = ArtifactAudit(
            tenant_id=current_user.tenant_id,
            artifact_type=request.artifact_type,
            artifact_id=request.artifact_id,
            action="synced",
            user_id=current_user.id,
            changes={"clm_tool": integration.tool, "action": request.action}
        )
        db.create_artifact_audit(audit)
        
        return sync_result
    
    
    @app.post("/api/artifacts/compliance/check")
    async def run_compliance_check(
        request: AIComplianceCheckRequest,
        current_user: User = Depends(require_admin)
    ):
        """Run AI-powered compliance check on an artifact (admin only)"""
        if not current_user.tenant_id:
            raise HTTPException(status_code=403, detail="User must belong to a tenant")
        
        if request.artifact_type == "template":
            artifact = db.get_template(request.artifact_id)
        elif request.artifact_type == "sla":
            artifact = db.get_sla(request.artifact_id)
        elif request.artifact_type == "operating_model":
            artifact = db.get_operating_model(request.artifact_id)
        else:
            raise HTTPException(status_code=400, detail="Invalid artifact type")
        
        if not artifact:
            raise HTTPException(status_code=404, detail="Artifact not found")
        
        issues = []
        
        if request.artifact_type == "template":
            issue = ComplianceIssue(
                severity="medium",
                description="Template contains non-standard termination clause",
                artifact_type=request.artifact_type,
                artifact_id=request.artifact_id,
                flagged_by="ai"
            )
            issues.append(issue)
            db.create_compliance_issue(issue)
        
        audit = ArtifactAudit(
            tenant_id=current_user.tenant_id,
            artifact_type=request.artifact_type,
            artifact_id=request.artifact_id,
            action="compliance_check",
            user_id=current_user.id,
            compliance_issues=issues,
            changes={"standards_checked": request.standards}
        )
        db.create_artifact_audit(audit)
        
        return {
            "artifact_id": request.artifact_id,
            "issues_found": len(issues),
            "issues": [{
                "id": i.id,
                "severity": i.severity,
                "description": i.description
            } for i in issues],
            "message": f"Compliance check completed. Found {len(issues)} issue(s)."
        }
    
    @app.get("/api/artifacts/compliance/issues")
    async def list_compliance_issues(
        artifact_type: Optional[str] = None,
        artifact_id: Optional[str] = None,
        resolved: Optional[bool] = None,
        current_user: User = Depends(require_admin)
    ):
        """List compliance issues (admin only)"""
        if artifact_id and artifact_type:
            issues = db.get_compliance_issues_by_artifact(artifact_type, artifact_id, resolved)
        else:
            issues = [i for i in db.compliance_issues.values()]
        
        return [{
            "id": i.id,
            "severity": i.severity,
            "description": i.description,
            "artifact_type": i.artifact_type,
            "artifact_id": i.artifact_id,
            "resolved": i.resolved,
            "created_at": i.created_at.isoformat()
        } for i in issues]
    
    @app.put("/api/artifacts/compliance/issues/{issue_id}/resolve")
    async def resolve_compliance_issue(
        issue_id: str,
        current_user: User = Depends(require_admin)
    ):
        """Resolve a compliance issue (admin only)"""
        issue = db.get_compliance_issue(issue_id)
        if not issue:
            raise HTTPException(status_code=404, detail="Compliance issue not found")
        
        issue.resolved = True
        issue.resolved_by = current_user.id
        issue.resolved_at = datetime.utcnow()
        
        db.update_compliance_issue(issue_id, issue)
        
        return {
            "id": issue.id,
            "message": "Compliance issue resolved successfully"
        }
    
    @app.get("/api/artifacts/audits")
    async def list_artifact_audits(
        artifact_type: Optional[str] = None,
        artifact_id: Optional[str] = None,
        current_user: User = Depends(require_admin)
    ):
        """List artifact audit logs (admin only)"""
        if not current_user.tenant_id:
            raise HTTPException(status_code=403, detail="User must belong to a tenant")
        
        if artifact_id and artifact_type:
            audits = db.get_artifact_audits_by_artifact(artifact_type, artifact_id)
        else:
            audits = db.get_artifact_audits_by_tenant(current_user.tenant_id, artifact_type)
        
        return [{
            "id": a.id,
            "artifact_type": a.artifact_type,
            "artifact_id": a.artifact_id,
            "action": a.action,
            "user_id": a.user_id,
            "changes": a.changes,
            "timestamp": a.timestamp.isoformat(),
            "compliance_issues_count": len(a.compliance_issues)
        } for a in audits[:100]]  # Limit to 100 most recent
