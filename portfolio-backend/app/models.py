from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import uuid4

def generate_id():
    return str(uuid4())

class SWOT(BaseModel):
    strengths: str = ""
    weaknesses: str = ""
    opportunities: str = ""
    threats: str = ""

class BusinessCase(BaseModel):
    problem: str = ""
    value_prop: str = ""
    swot: SWOT = Field(default_factory=SWOT)
    template: str = "blank"

class Competitor(BaseModel):
    id: str = Field(default_factory=generate_id)
    name: str
    strengths: str
    weaknesses: str

class Persona(BaseModel):
    id: str = Field(default_factory=generate_id)
    demographics: str
    pain_points: str

class Feedback(BaseModel):
    id: str = Field(default_factory=generate_id)
    source: str
    text: str
    sentiment: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MarketResearch(BaseModel):
    competitors: List[Competitor] = Field(default_factory=list)
    personas: List[Persona] = Field(default_factory=list)
    feedback: List[Feedback] = Field(default_factory=list)
    chart_data: Dict[str, Any] = Field(default_factory=dict)

class Milestone(BaseModel):
    id: str = Field(default_factory=generate_id)
    title: str
    date: str
    dependencies: List[str] = Field(default_factory=list)
    description: str = ""

class Roadmap(BaseModel):
    milestones: List[Milestone] = Field(default_factory=list)

class FundingSource(BaseModel):
    id: str = Field(default_factory=generate_id)
    source: str
    amount: float

class Scenarios(BaseModel):
    multiplier: float = 1.0

class Investment(BaseModel):
    budget: float = 0.0
    revenue: float = 0.0
    roi: float = 0.0
    npv: float = 0.0
    funding: List[FundingSource] = Field(default_factory=list)
    scenarios: Scenarios = Field(default_factory=Scenarios)

class KPI(BaseModel):
    id: str = Field(default_factory=generate_id)
    metric: str
    value: float

class Lifecycle(BaseModel):
    current_stage: str = "Ideation"
    kpis: List[KPI] = Field(default_factory=list)
    reminders: List[str] = Field(default_factory=list)

class Version(BaseModel):
    id: str = Field(default_factory=generate_id)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    user_id: str
    changes: Dict[str, Any] = Field(default_factory=dict)
    snapshot: Dict[str, Any] = Field(default_factory=dict)

class HierarchyNode(BaseModel):
    parent_id: Optional[str] = None
    level: str = "portfolio"  # "program", "portfolio", "product"
    order: int = 0

class CustomTerm(BaseModel):
    key: str  # e.g., "milestone", "portfolio", "kpi"
    value: str  # e.g., "Epic", "Product", "Metric"

class Portfolio(BaseModel):
    id: str = Field(default_factory=generate_id)
    name: str
    description: str = ""
    owner_id: str
    collaborators: List[str] = Field(default_factory=list)
    tenant_id: Optional[str] = None
    hierarchy: HierarchyNode = Field(default_factory=HierarchyNode)
    custom_terms: List[CustomTerm] = Field(default_factory=list)
    business_case: BusinessCase = Field(default_factory=BusinessCase)
    market_research: MarketResearch = Field(default_factory=MarketResearch)
    roadmap: Roadmap = Field(default_factory=Roadmap)
    investment: Investment = Field(default_factory=Investment)
    lifecycle: Lifecycle = Field(default_factory=Lifecycle)
    versions: List[Version] = Field(default_factory=list)
    health_score: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ResetToken(BaseModel):
    token: str
    expiry: datetime

class User(BaseModel):
    id: str = Field(default_factory=generate_id)
    email: str
    name: str = ""
    hashed_password: str = ""
    firebase_uid: Optional[str] = None
    portfolios: List[str] = Field(default_factory=list)
    role: str = "user"  # "user", "admin"
    tenant_id: Optional[str] = None
    status: str = "active"  # "active", "inactive"
    last_login: Optional[datetime] = None
    reset_token: Optional[ResetToken] = None
    token_version: int = 0
    require_password_change: bool = False
    deactivated_at: Optional[datetime] = None
    deactivated_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Notification(BaseModel):
    id: str = Field(default_factory=generate_id)
    user_id: str
    portfolio_id: str
    type: str
    message: str
    read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CreatePortfolioRequest(BaseModel):
    name: str
    description: str = ""

class UpdateBusinessCaseRequest(BaseModel):
    problem: Optional[str] = None
    value_prop: Optional[str] = None
    swot: Optional[SWOT] = None
    template: Optional[str] = None

class CreateMilestoneRequest(BaseModel):
    title: str
    date: str
    dependencies: List[str] = Field(default_factory=list)
    description: str = ""

class UpdateInvestmentRequest(BaseModel):
    budget: Optional[float] = None
    revenue: Optional[float] = None
    scenarios: Optional[Scenarios] = None

class CreateFeedbackRequest(BaseModel):
    source: str
    text: str

class AIRequest(BaseModel):
    portfolio_id: str
    data: Dict[str, Any]

class Comment(BaseModel):
    id: str = Field(default_factory=generate_id)
    user: str
    text: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Idea(BaseModel):
    id: str = Field(default_factory=generate_id)
    portfolio_id: str
    title: str
    description: str
    category: str = "Feature Request"  # "Feature Request", "Bug", "Enhancement"
    status: str = "Submitted"  # "Submitted", "Under Review", "Planned", "Implemented", "Rejected"
    votes: int = 0
    voters: List[str] = Field(default_factory=list)  # Track who voted
    comments: List[Comment] = Field(default_factory=list)
    linked_to: Optional[Dict[str, str]] = None  # {"type": "milestone", "id": "..."}
    created_by: str = "anonymous"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class AvailabilitySlot(BaseModel):
    start: str  # ISO date string
    end: str  # ISO date string
    hours_per_day: float

class CapacityResource(BaseModel):
    id: str = Field(default_factory=generate_id)
    portfolio_id: str
    user_id: str
    name: str
    role: str
    availability: List[AvailabilitySlot] = Field(default_factory=list)

class EffortEstimate(BaseModel):
    milestone_id: str
    effort_points: float
    assigned_resources: List[str] = Field(default_factory=list)

class CustomReport(BaseModel):
    id: str = Field(default_factory=generate_id)
    portfolio_id: str
    name: str
    type: str = "chart"  # "pivot", "chart", "list"
    config: Dict[str, Any] = Field(default_factory=dict)
    owner_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Whiteboard(BaseModel):
    id: str = Field(default_factory=generate_id)
    portfolio_id: str
    name: str
    linked_to: Optional[Dict[str, str]] = None
    data: Dict[str, Any] = Field(default_factory=dict)  # Excalidraw JSON
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Integration(BaseModel):
    id: str = Field(default_factory=generate_id)
    portfolio_id: str
    type: str  # "salesforce", "figma", "jira", "slack"
    config: Dict[str, Any] = Field(default_factory=dict)
    enabled: bool = True
    last_sync: Optional[datetime] = None

class CreateIdeaRequest(BaseModel):
    title: str
    description: str
    category: str = "Feature Request"
    created_by: str = "anonymous"

class CreateCommentRequest(BaseModel):
    user: str
    text: str

class CreateCapacityResourceRequest(BaseModel):
    user_id: str
    name: str
    role: str

class UpdateEffortEstimateRequest(BaseModel):
    effort_points: float
    assigned_resources: List[str] = Field(default_factory=list)

class CreateReportRequest(BaseModel):
    name: str
    type: str
    config: Dict[str, Any]

class CreateWhiteboardRequest(BaseModel):
    name: str
    linked_to: Optional[Dict[str, str]] = None

class CreateIntegrationRequest(BaseModel):
    type: str
    config: Dict[str, Any]

class Tenant(BaseModel):
    id: str = Field(default_factory=generate_id)
    company_name: str
    users: List[str] = Field(default_factory=list)  # User IDs
    portfolios: List[str] = Field(default_factory=list)  # Portfolio IDs
    settings: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class AuditLog(BaseModel):
    id: str = Field(default_factory=generate_id)
    tenant_id: str
    user_id: str
    action: str  # "create", "update", "delete", "view"
    resource_type: str  # "portfolio", "user", "tenant", etc.
    resource_id: str
    details: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class Workspace(BaseModel):
    id: str = Field(default_factory=generate_id)
    tenant_id: str
    name: str
    description: str = ""
    parent_id: Optional[str] = None
    level: str = "portfolio"  # "program", "portfolio", "product"
    portfolios: List[str] = Field(default_factory=list)
    custom_terms: List[CustomTerm] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CreateTenantRequest(BaseModel):
    company_name: str
    admin_email: Optional[str] = None
    admin_name: Optional[str] = None

class UpdateTenantRequest(BaseModel):
    company_name: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None

class CreateWorkspaceRequest(BaseModel):
    name: str
    description: str = ""
    parent_id: Optional[str] = None
    level: str = "portfolio"

class UpdateWorkspaceRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    parent_id: Optional[str] = None
    custom_terms: Optional[List[CustomTerm]] = None

class UpdateUserRoleRequest(BaseModel):
    role: str  # "user", "admin"

class UpdateCustomTermsRequest(BaseModel):
    custom_terms: List[CustomTerm]

class LoginRequest(BaseModel):
    email: str
    password: str

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class CreateUserRequest(BaseModel):
    email: str
    password: Optional[str] = None  # If None, auto-generate
    role: str = "user"  # "user", "admin"
    name: str = ""

class UpdateUserRequest(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    name: Optional[str] = None

class ResetPasswordRequest(BaseModel):
    email: str

class ConfirmResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class AdminResetPasswordRequest(BaseModel):
    pass  # No body needed, just trigger the reset


class Clause(BaseModel):
    id: str = Field(default_factory=generate_id)
    text: str
    approved: bool = False
    category: str = ""  # e.g., "liability", "termination", "payment"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TemplateVersion(BaseModel):
    version: int
    content: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    changed_by: str

class ContractTemplate(BaseModel):
    id: str = Field(default_factory=generate_id)
    tenant_id: str
    name: str
    type: str  # "NDA", "MSA", "SOW", "SLA", "Custom"
    content: Dict[str, Any] = Field(default_factory=dict)  # Rich text content with placeholders
    clauses: List[Clause] = Field(default_factory=list)
    versions: List[TemplateVersion] = Field(default_factory=list)
    status: str = "draft"  # "draft", "approved", "archived"
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class OperatingModelSection(BaseModel):
    key: str  # e.g., "key_partners", "value_propositions"
    content: str = ""
    ai_suggested: bool = False

class OperatingModel(BaseModel):
    id: str = Field(default_factory=generate_id)
    portfolio_id: str
    tenant_id: str
    name: str
    template_type: str = "business_model_canvas"  # "business_model_canvas", "lean_canvas", "custom"
    sections: List[OperatingModelSection] = Field(default_factory=list)
    linked_roadmap_ids: List[str] = Field(default_factory=list)
    linked_investment_id: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class SLAMetric(BaseModel):
    name: str  # e.g., "uptime", "response_time", "resolution_time"
    target: float  # Target value (e.g., 99.9 for uptime percentage)
    current: float = 0.0  # Current measured value
    unit: str = ""  # e.g., "%", "hours", "minutes"
    breach_threshold: float = 0.0  # When to trigger alert

class SLA(BaseModel):
    id: str = Field(default_factory=generate_id)
    tenant_id: str
    portfolio_id: Optional[str] = None
    name: str
    description: str = ""
    metrics: List[SLAMetric] = Field(default_factory=list)
    status: str = "draft"  # "draft", "active", "breached", "expired"
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    renewal_reminder_days: int = 30
    linked_template_id: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_checked: Optional[datetime] = None

class CLMSync(BaseModel):
    tool: str  # "ironclad", "docusign", "custom"
    external_id: str
    last_sync: datetime = Field(default_factory=datetime.utcnow)
    sync_status: str = "success"  # "success", "failed", "pending"
    error_message: Optional[str] = None

class CLMIntegration(BaseModel):
    id: str = Field(default_factory=generate_id)
    tenant_id: str
    tool: str  # "ironclad", "docusign"
    config: Dict[str, Any] = Field(default_factory=dict)  # OAuth tokens, API keys, etc.
    enabled: bool = True
    test_mode: bool = False
    field_mappings: Dict[str, str] = Field(default_factory=dict)  # Map internal fields to CLM fields
    webhook_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ComplianceIssue(BaseModel):
    id: str = Field(default_factory=generate_id)
    severity: str = "low"  # "low", "medium", "high", "critical"
    description: str
    artifact_type: str  # "template", "sla", "operating_model"
    artifact_id: str
    flagged_by: str = "ai"  # "ai", "manual"
    resolved: bool = False
    resolved_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ArtifactAudit(BaseModel):
    id: str = Field(default_factory=generate_id)
    tenant_id: str
    artifact_type: str  # "template", "sla", "operating_model"
    artifact_id: str
    action: str  # "created", "updated", "approved", "archived", "synced"
    user_id: str
    changes: Dict[str, Any] = Field(default_factory=dict)
    compliance_issues: List[ComplianceIssue] = Field(default_factory=list)
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class CreateTemplateRequest(BaseModel):
    name: str
    type: str
    content: Dict[str, Any] = Field(default_factory=dict)
    clauses: List[Clause] = Field(default_factory=list)

class UpdateTemplateRequest(BaseModel):
    name: Optional[str] = None
    content: Optional[Dict[str, Any]] = None
    clauses: Optional[List[Clause]] = None
    status: Optional[str] = None

class CreateOperatingModelRequest(BaseModel):
    portfolio_id: str
    name: str
    template_type: str = "business_model_canvas"
    sections: List[OperatingModelSection] = Field(default_factory=list)

class UpdateOperatingModelRequest(BaseModel):
    name: Optional[str] = None
    sections: Optional[List[OperatingModelSection]] = None
    linked_roadmap_ids: Optional[List[str]] = None

class CreateSLARequest(BaseModel):
    portfolio_id: Optional[str] = None
    name: str
    description: str = ""
    metrics: List[SLAMetric] = Field(default_factory=list)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class UpdateSLARequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    metrics: Optional[List[SLAMetric]] = None
    status: Optional[str] = None

class CreateCLMIntegrationRequest(BaseModel):
    tool: str
    config: Dict[str, Any]
    field_mappings: Dict[str, str] = Field(default_factory=dict)
    test_mode: bool = False

class SyncArtifactRequest(BaseModel):
    artifact_type: str  # "template", "sla"
    artifact_id: str
    action: str = "push"  # "push", "pull"

class AIComplianceCheckRequest(BaseModel):
    artifact_type: str
    artifact_id: str
    standards: List[str] = Field(default_factory=list)  # List of compliance standards to check against
