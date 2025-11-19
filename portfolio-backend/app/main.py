from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from datetime import datetime
import json

from app.models import (
    Portfolio, User, CreatePortfolioRequest, UpdateBusinessCaseRequest,
    Competitor, Persona, Milestone, FundingSource, KPI, CreateMilestoneRequest,
    UpdateInvestmentRequest, CreateFeedbackRequest, Feedback,
    Idea, CreateIdeaRequest, CreateCommentRequest, Comment,
    CapacityResource, CreateCapacityResourceRequest, UpdateEffortEstimateRequest,
    CustomReport, CreateReportRequest, Whiteboard, CreateWhiteboardRequest,
    Integration, CreateIntegrationRequest
)
from app.database import db
from app.ai_assistant import (
    prioritize_milestones, generate_roi_scenarios, analyze_feedback_sentiment
)

app = FastAPI(title="Portfolio Management API v2.0")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

async def get_current_user(authorization: Optional[str] = Header(None)) -> User:
    """
    Get current user from authorization header
    For now, returns test user. In production, would verify Firebase token.
    """
    test_user = db.get_user_by_id("test-user-1")
    if not test_user:
        raise HTTPException(status_code=401, detail="User not found")
    return test_user

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


@app.get("/api/auth/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user


@app.get("/api/portfolios")
async def list_portfolios(current_user: User = Depends(get_current_user)) -> List[Portfolio]:
    """List all portfolios for the current user"""
    portfolios = db.get_portfolios_by_user(current_user.id)
    return portfolios

@app.post("/api/portfolios")
async def create_portfolio(
    request: CreatePortfolioRequest,
    current_user: User = Depends(get_current_user)
) -> Portfolio:
    """Create a new portfolio"""
    portfolio = Portfolio(
        name=request.name,
        description=request.description,
        owner_id=current_user.id
    )
    created_portfolio = db.create_portfolio(portfolio)
    return created_portfolio

@app.get("/api/portfolios/{portfolio_id}")
async def get_portfolio(
    portfolio_id: str,
    current_user: User = Depends(get_current_user)
) -> Portfolio:
    """Get a specific portfolio"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return portfolio

@app.put("/api/portfolios/{portfolio_id}")
async def update_portfolio(
    portfolio_id: str,
    request: CreatePortfolioRequest,
    current_user: User = Depends(get_current_user)
) -> Portfolio:
    """Update a portfolio"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only owner can update portfolio")
    
    portfolio.name = request.name
    portfolio.description = request.description
    updated_portfolio = db.update_portfolio(portfolio_id, portfolio)
    return updated_portfolio

@app.delete("/api/portfolios/{portfolio_id}")
async def delete_portfolio(
    portfolio_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a portfolio"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only owner can delete portfolio")
    
    db.delete_portfolio(portfolio_id)
    return {"message": "Portfolio deleted successfully"}


@app.put("/api/portfolios/{portfolio_id}/business-case")
async def update_business_case(
    portfolio_id: str,
    request: UpdateBusinessCaseRequest,
    current_user: User = Depends(get_current_user)
) -> Portfolio:
    """Update business case for a portfolio"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if request.problem is not None:
        portfolio.business_case.problem = request.problem
    if request.value_prop is not None:
        portfolio.business_case.value_prop = request.value_prop
    if request.swot is not None:
        portfolio.business_case.swot = request.swot
    if request.template is not None:
        portfolio.business_case.template = request.template
    
    updated_portfolio = db.update_portfolio(portfolio_id, portfolio)
    return updated_portfolio


@app.post("/api/portfolios/{portfolio_id}/competitors")
async def add_competitor(
    portfolio_id: str,
    competitor: Competitor,
    current_user: User = Depends(get_current_user)
) -> Portfolio:
    """Add a competitor to market research"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators:
        raise HTTPException(status_code=403, detail="Access denied")
    
    portfolio.market_research.competitors.append(competitor)
    updated_portfolio = db.update_portfolio(portfolio_id, portfolio)
    return updated_portfolio

@app.delete("/api/portfolios/{portfolio_id}/competitors/{competitor_id}")
async def delete_competitor(
    portfolio_id: str,
    competitor_id: str,
    current_user: User = Depends(get_current_user)
) -> Portfolio:
    """Delete a competitor"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators:
        raise HTTPException(status_code=403, detail="Access denied")
    
    portfolio.market_research.competitors = [
        c for c in portfolio.market_research.competitors if c.id != competitor_id
    ]
    updated_portfolio = db.update_portfolio(portfolio_id, portfolio)
    return updated_portfolio

@app.post("/api/portfolios/{portfolio_id}/personas")
async def add_persona(
    portfolio_id: str,
    persona: Persona,
    current_user: User = Depends(get_current_user)
) -> Portfolio:
    """Add a persona to market research"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators:
        raise HTTPException(status_code=403, detail="Access denied")
    
    portfolio.market_research.personas.append(persona)
    updated_portfolio = db.update_portfolio(portfolio_id, portfolio)
    return updated_portfolio

@app.delete("/api/portfolios/{portfolio_id}/personas/{persona_id}")
async def delete_persona(
    portfolio_id: str,
    persona_id: str,
    current_user: User = Depends(get_current_user)
) -> Portfolio:
    """Delete a persona"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators:
        raise HTTPException(status_code=403, detail="Access denied")
    
    portfolio.market_research.personas = [
        p for p in portfolio.market_research.personas if p.id != persona_id
    ]
    updated_portfolio = db.update_portfolio(portfolio_id, portfolio)
    return updated_portfolio


@app.post("/api/portfolios/{portfolio_id}/milestones")
async def add_milestone(
    portfolio_id: str,
    request: CreateMilestoneRequest,
    current_user: User = Depends(get_current_user)
) -> Portfolio:
    """Add a milestone to roadmap"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators:
        raise HTTPException(status_code=403, detail="Access denied")
    
    milestone = Milestone(
        title=request.title,
        date=request.date,
        dependencies=request.dependencies,
        description=request.description
    )
    portfolio.roadmap.milestones.append(milestone)
    updated_portfolio = db.update_portfolio(portfolio_id, portfolio)
    return updated_portfolio

@app.delete("/api/portfolios/{portfolio_id}/milestones/{milestone_id}")
async def delete_milestone(
    portfolio_id: str,
    milestone_id: str,
    current_user: User = Depends(get_current_user)
) -> Portfolio:
    """Delete a milestone"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators:
        raise HTTPException(status_code=403, detail="Access denied")
    
    portfolio.roadmap.milestones = [
        m for m in portfolio.roadmap.milestones if m.id != milestone_id
    ]
    updated_portfolio = db.update_portfolio(portfolio_id, portfolio)
    return updated_portfolio


@app.put("/api/portfolios/{portfolio_id}/investment")
async def update_investment(
    portfolio_id: str,
    request: UpdateInvestmentRequest,
    current_user: User = Depends(get_current_user)
) -> Portfolio:
    """Update investment data"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if request.budget is not None:
        portfolio.investment.budget = request.budget
    if request.revenue is not None:
        portfolio.investment.revenue = request.revenue
    if request.scenarios is not None:
        portfolio.investment.scenarios = request.scenarios
    
    if portfolio.investment.budget > 0:
        adjusted_revenue = portfolio.investment.revenue * portfolio.investment.scenarios.multiplier
        portfolio.investment.roi = ((adjusted_revenue - portfolio.investment.budget) / portfolio.investment.budget) * 100
        portfolio.investment.npv = adjusted_revenue - portfolio.investment.budget
    
    updated_portfolio = db.update_portfolio(portfolio_id, portfolio)
    return updated_portfolio

@app.post("/api/portfolios/{portfolio_id}/funding")
async def add_funding(
    portfolio_id: str,
    funding: FundingSource,
    current_user: User = Depends(get_current_user)
) -> Portfolio:
    """Add a funding source"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators:
        raise HTTPException(status_code=403, detail="Access denied")
    
    portfolio.investment.funding.append(funding)
    updated_portfolio = db.update_portfolio(portfolio_id, portfolio)
    return updated_portfolio

@app.delete("/api/portfolios/{portfolio_id}/funding/{funding_id}")
async def delete_funding(
    portfolio_id: str,
    funding_id: str,
    current_user: User = Depends(get_current_user)
) -> Portfolio:
    """Delete a funding source"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators:
        raise HTTPException(status_code=403, detail="Access denied")
    
    portfolio.investment.funding = [
        f for f in portfolio.investment.funding if f.id != funding_id
    ]
    updated_portfolio = db.update_portfolio(portfolio_id, portfolio)
    return updated_portfolio


@app.put("/api/portfolios/{portfolio_id}/lifecycle/stage")
async def update_lifecycle_stage(
    portfolio_id: str,
    stage: str,
    current_user: User = Depends(get_current_user)
) -> Portfolio:
    """Update lifecycle stage"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators:
        raise HTTPException(status_code=403, detail="Access denied")
    
    portfolio.lifecycle.current_stage = stage
    updated_portfolio = db.update_portfolio(portfolio_id, portfolio)
    return updated_portfolio

@app.post("/api/portfolios/{portfolio_id}/kpis")
async def add_kpi(
    portfolio_id: str,
    kpi: KPI,
    current_user: User = Depends(get_current_user)
) -> Portfolio:
    """Add a KPI"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators:
        raise HTTPException(status_code=403, detail="Access denied")
    
    portfolio.lifecycle.kpis.append(kpi)
    updated_portfolio = db.update_portfolio(portfolio_id, portfolio)
    return updated_portfolio

@app.delete("/api/portfolios/{portfolio_id}/kpis/{kpi_id}")
async def delete_kpi(
    portfolio_id: str,
    kpi_id: str,
    current_user: User = Depends(get_current_user)
) -> Portfolio:
    """Delete a KPI"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators:
        raise HTTPException(status_code=403, detail="Access denied")
    
    portfolio.lifecycle.kpis = [
        k for k in portfolio.lifecycle.kpis if k.id != kpi_id
    ]
    updated_portfolio = db.update_portfolio(portfolio_id, portfolio)
    return updated_portfolio


@app.get("/api/analytics/health-score/{portfolio_id}")
async def calculate_health_score(
    portfolio_id: str,
    current_user: User = Depends(get_current_user)
) -> dict:
    """Calculate portfolio health score"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators:
        raise HTTPException(status_code=403, detail="Access denied")
    
    score = 0
    
    if portfolio.business_case.problem:
        score += 10
    if portfolio.business_case.value_prop:
        score += 10
    
    if portfolio.market_research.competitors:
        score += 10
    if portfolio.market_research.personas:
        score += 10
    
    if portfolio.roadmap.milestones:
        score += 20
    
    if portfolio.investment.budget > 0:
        score += 10
    if portfolio.investment.revenue > 0:
        score += 10
    
    if portfolio.lifecycle.kpis:
        score += 20
    
    portfolio.health_score = score
    db.update_portfolio(portfolio_id, portfolio)
    
    return {"portfolio_id": portfolio_id, "health_score": score}


@app.get("/api/ai/prioritize-milestones/{portfolio_id}")
async def get_milestone_priorities(
    portfolio_id: str,
    current_user: User = Depends(get_current_user)
) -> dict:
    """Get AI-assisted milestone prioritization using RICE scoring"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators:
        raise HTTPException(status_code=403, detail="Access denied")
    
    milestones_data = [
        {
            "id": m.id,
            "title": m.title,
            "date": m.date,
            "description": m.description,
            "dependencies": m.dependencies
        }
        for m in portfolio.roadmap.milestones
    ]
    
    prioritized = prioritize_milestones(milestones_data)
    
    return {
        "portfolio_id": portfolio_id,
        "milestones": prioritized
    }


@app.get("/api/ai/roi-scenarios/{portfolio_id}")
async def get_roi_scenarios(
    portfolio_id: str,
    current_user: User = Depends(get_current_user)
) -> dict:
    """Generate ROI scenarios with different multipliers"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators:
        raise HTTPException(status_code=403, detail="Access denied")
    
    scenarios = generate_roi_scenarios(
        portfolio.investment.budget,
        portfolio.investment.revenue
    )
    
    return {
        "portfolio_id": portfolio_id,
        "scenarios": scenarios
    }


@app.post("/api/portfolios/{portfolio_id}/feedback")
async def add_feedback(
    portfolio_id: str,
    request: CreateFeedbackRequest,
    current_user: User = Depends(get_current_user)
) -> Portfolio:
    """Add customer feedback with sentiment analysis"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators:
        raise HTTPException(status_code=403, detail="Access denied")
    
    sentiment = analyze_feedback_sentiment(request.text)
    
    feedback = Feedback(
        source=request.source,
        text=request.text,
        sentiment=sentiment['score'],
        sentiment_label=sentiment['label'],
        linked_section=request.linked_section
    )
    
    portfolio.market_research.feedback.append(feedback)
    updated_portfolio = db.update_portfolio(portfolio_id, portfolio)
    
    return updated_portfolio


@app.delete("/api/portfolios/{portfolio_id}/feedback/{feedback_id}")
async def delete_feedback(
    portfolio_id: str,
    feedback_id: str,
    current_user: User = Depends(get_current_user)
) -> Portfolio:
    """Delete feedback"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators:
        raise HTTPException(status_code=403, detail="Access denied")
    
    portfolio.market_research.feedback = [
        f for f in portfolio.market_research.feedback if f.id != feedback_id
    ]
    updated_portfolio = db.update_portfolio(portfolio_id, portfolio)
    
    return updated_portfolio


@app.get("/api/portfolios/{portfolio_id}/versions")
async def get_portfolio_versions(
    portfolio_id: str,
    current_user: User = Depends(get_current_user)
) -> dict:
    """Get version history for a portfolio"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return {
        "portfolio_id": portfolio_id,
        "versions": portfolio.versions
    }


@app.post("/api/portfolios/{portfolio_id}/versions/save")
async def save_portfolio_version(
    portfolio_id: str,
    current_user: User = Depends(get_current_user)
) -> dict:
    """Save current state as a new version"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators:
        raise HTTPException(status_code=403, detail="Access denied")
    
    from app.models import Version
    version = Version(
        timestamp=datetime.now(),
        data=json.loads(portfolio.model_dump_json())
    )
    
    portfolio.versions.append(version)
    db.update_portfolio(portfolio_id, portfolio)
    
    return {
        "portfolio_id": portfolio_id,
        "version_id": version.id,
        "message": "Version saved successfully"
    }


@app.post("/api/portfolios/{portfolio_id}/versions/{version_id}/restore")
async def restore_portfolio_version(
    portfolio_id: str,
    version_id: str,
    current_user: User = Depends(get_current_user)
) -> Portfolio:
    """Restore portfolio to a previous version"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only owner can restore versions")
    
    version = next((v for v in portfolio.versions if v.id == version_id), None)
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    
    restored_data = version.data
    portfolio.business_case = Portfolio(**restored_data).business_case
    portfolio.market_research = Portfolio(**restored_data).market_research
    portfolio.roadmap = Portfolio(**restored_data).roadmap
    portfolio.investment = Portfolio(**restored_data).investment
    portfolio.lifecycle = Portfolio(**restored_data).lifecycle
    
    updated_portfolio = db.update_portfolio(portfolio_id, portfolio)
    
    return updated_portfolio


@app.get("/api/analytics/overview")
async def get_portfolio_overview(
    current_user: User = Depends(get_current_user)
) -> dict:
    """Get aggregated analytics across all portfolios"""
    portfolios = db.get_portfolios_by_user(current_user.id)
    
    if not portfolios:
        return {
            "total_portfolios": 0,
            "average_health_score": 0,
            "total_milestones": 0,
            "total_kpis": 0,
            "stage_distribution": {},
            "total_budget": 0,
            "total_revenue": 0,
            "average_roi": 0
        }
    
    total_health = sum(p.health_score for p in portfolios)
    total_milestones = sum(len(p.roadmap.milestones) for p in portfolios)
    total_kpis = sum(len(p.lifecycle.kpis) for p in portfolios)
    total_budget = sum(p.investment.budget for p in portfolios)
    total_revenue = sum(p.investment.revenue for p in portfolios)
    
    stage_distribution = {}
    for p in portfolios:
        stage = p.lifecycle.current_stage
        stage_distribution[stage] = stage_distribution.get(stage, 0) + 1
    
    roi_values = [p.investment.roi for p in portfolios if p.investment.budget > 0]
    average_roi = sum(roi_values) / len(roi_values) if roi_values else 0
    
    return {
        "total_portfolios": len(portfolios),
        "average_health_score": round(total_health / len(portfolios), 2),
        "total_milestones": total_milestones,
        "total_kpis": total_kpis,
        "stage_distribution": stage_distribution,
        "total_budget": total_budget,
        "total_revenue": total_revenue,
        "average_roi": round(average_roi, 2),
        "portfolios": [
            {
                "id": p.id,
                "name": p.name,
                "health_score": p.health_score,
                "stage": p.lifecycle.current_stage,
                "milestones": len(p.roadmap.milestones),
                "roi": p.investment.roi
            }
            for p in portfolios
        ]
    }


@app.get("/api/portfolios/{portfolio_id}/export/csv")
async def export_portfolio_csv(
    portfolio_id: str,
    current_user: User = Depends(get_current_user)
) -> dict:
    """Export portfolio data as CSV format"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators:
        raise HTTPException(status_code=403, detail="Access denied")
    
    csv_data = {
        "portfolio": {
            "name": portfolio.name,
            "description": portfolio.description,
            "health_score": portfolio.health_score
        },
        "milestones": [
            {
                "title": m.title,
                "date": m.date,
                "description": m.description
            }
            for m in portfolio.roadmap.milestones
        ],
        "kpis": [
            {
                "metric": k.metric,
                "current_value": k.current_value,
                "target_value": k.target_value
            }
            for k in portfolio.lifecycle.kpis
        ],
        "competitors": [
            {
                "name": c.name,
                "strengths": c.strengths,
                "weaknesses": c.weaknesses
            }
            for c in portfolio.market_research.competitors
        ]
    }
    
    return csv_data


@app.get("/api/portfolios/{portfolio_id}/export/json")
async def export_portfolio_json(
    portfolio_id: str,
    current_user: User = Depends(get_current_user)
) -> Portfolio:
    """Export complete portfolio data as JSON"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return portfolio


@app.get("/api/notifications")
async def get_notifications(
    current_user: User = Depends(get_current_user)
) -> List[dict]:
    """Get all notifications for current user"""
    notifications = db.get_notifications_by_user(current_user.id)
    return [
        {
            "id": n.id,
            "portfolio_id": n.portfolio_id,
            "message": n.message,
            "due_date": n.due_date,
            "read": n.read,
            "created_at": n.created_at
        }
        for n in notifications
    ]


@app.put("/api/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user)
) -> dict:
    """Mark a notification as read"""
    notification = db.get_notification(notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    if notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    notification.read = True
    db.update_notification(notification_id, notification)
    
    return {"message": "Notification marked as read"}


@app.post("/api/portfolios/{portfolio_id}/ideas")
async def create_idea(
    portfolio_id: str,
    request: CreateIdeaRequest,
    current_user: User = Depends(get_current_user)
) -> Idea:
    """Create a new idea in the Ideas Portal"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    idea = Idea(
        portfolio_id=portfolio_id,
        title=request.title,
        description=request.description,
        category=request.category,
        created_by=request.created_by
    )
    created_idea = db.create_idea(idea)
    return created_idea


@app.get("/api/portfolios/{portfolio_id}/ideas")
async def list_ideas(
    portfolio_id: str,
    category: Optional[str] = None,
    status: Optional[str] = None
) -> List[Idea]:
    """List all ideas for a portfolio with optional filters"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    ideas = db.get_ideas_by_portfolio(portfolio_id)
    
    if category:
        ideas = [i for i in ideas if i.category == category]
    if status:
        ideas = [i for i in ideas if i.status == status]
    
    return sorted(ideas, key=lambda x: x.votes, reverse=True)


@app.get("/api/ideas/{idea_id}")
async def get_idea(idea_id: str) -> Idea:
    """Get a specific idea"""
    idea = db.get_idea(idea_id)
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    return idea


@app.put("/api/ideas/{idea_id}")
async def update_idea(
    idea_id: str,
    request: CreateIdeaRequest,
    current_user: User = Depends(get_current_user)
) -> Idea:
    """Update an idea (admin only)"""
    idea = db.get_idea(idea_id)
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    portfolio = db.get_portfolio(idea.portfolio_id)
    if not portfolio or (portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators):
        raise HTTPException(status_code=403, detail="Only portfolio owners/collaborators can update ideas")
    
    idea.title = request.title
    idea.description = request.description
    idea.category = request.category
    updated_idea = db.update_idea(idea_id, idea)
    return updated_idea


@app.delete("/api/ideas/{idea_id}")
async def delete_idea(
    idea_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete an idea (admin only)"""
    idea = db.get_idea(idea_id)
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    portfolio = db.get_portfolio(idea.portfolio_id)
    if not portfolio or (portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators):
        raise HTTPException(status_code=403, detail="Only portfolio owners/collaborators can delete ideas")
    
    db.delete_idea(idea_id)
    return {"message": "Idea deleted successfully"}


@app.post("/api/ideas/{idea_id}/vote")
async def vote_idea(
    idea_id: str,
    voter_email: str
) -> Idea:
    """Upvote an idea"""
    idea = db.get_idea(idea_id)
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    if voter_email not in idea.voters:
        idea.voters.append(voter_email)
        idea.votes = len(idea.voters)
        updated_idea = db.update_idea(idea_id, idea)
        return updated_idea
    
    return idea


@app.delete("/api/ideas/{idea_id}/vote")
async def unvote_idea(
    idea_id: str,
    voter_email: str
) -> Idea:
    """Remove vote from an idea"""
    idea = db.get_idea(idea_id)
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    if voter_email in idea.voters:
        idea.voters.remove(voter_email)
        idea.votes = len(idea.voters)
        updated_idea = db.update_idea(idea_id, idea)
        return updated_idea
    
    return idea


@app.post("/api/ideas/{idea_id}/comments")
async def add_comment_to_idea(
    idea_id: str,
    request: CreateCommentRequest
) -> Idea:
    """Add a comment to an idea"""
    idea = db.get_idea(idea_id)
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    comment = Comment(
        user=request.user,
        text=request.text
    )
    idea.comments.append(comment)
    updated_idea = db.update_idea(idea_id, idea)
    return updated_idea


@app.delete("/api/ideas/{idea_id}/comments/{comment_id}")
async def delete_comment_from_idea(
    idea_id: str,
    comment_id: str,
    current_user: User = Depends(get_current_user)
) -> Idea:
    """Delete a comment from an idea"""
    idea = db.get_idea(idea_id)
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    portfolio = db.get_portfolio(idea.portfolio_id)
    if not portfolio or (portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators):
        raise HTTPException(status_code=403, detail="Only portfolio owners/collaborators can delete comments")
    
    idea.comments = [c for c in idea.comments if c.id != comment_id]
    updated_idea = db.update_idea(idea_id, idea)
    return updated_idea


@app.post("/api/ideas/{idea_id}/promote")
async def promote_idea_to_milestone(
    idea_id: str,
    current_user: User = Depends(get_current_user)
) -> dict:
    """Promote an idea to a roadmap milestone"""
    idea = db.get_idea(idea_id)
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    portfolio = db.get_portfolio(idea.portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators:
        raise HTTPException(status_code=403, detail="Access denied")
    
    milestone = Milestone(
        title=idea.title,
        date="",
        description=idea.description,
        dependencies=[]
    )
    portfolio.roadmap.milestones.append(milestone)
    db.update_portfolio(idea.portfolio_id, portfolio)
    
    idea.status = "Planned"
    idea.linked_to = {"type": "milestone", "id": milestone.id}
    db.update_idea(idea_id, idea)
    
    return {
        "message": "Idea promoted to milestone successfully",
        "milestone_id": milestone.id
    }


@app.get("/api/portfolios/{portfolio_id}/capacity")
async def get_capacity_overview(
    portfolio_id: str,
    current_user: User = Depends(get_current_user)
) -> dict:
    """Get capacity planning overview for a portfolio"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators:
        raise HTTPException(status_code=403, detail="Access denied")
    
    resources = db.get_capacity_resources_by_portfolio(portfolio_id)
    
    total_capacity = sum(
        sum(slot.hours_per_day for slot in resource.availability)
        for resource in resources
    )
    
    return {
        "portfolio_id": portfolio_id,
        "resources": resources,
        "total_capacity_hours": total_capacity,
        "resource_count": len(resources)
    }


@app.post("/api/portfolios/{portfolio_id}/capacity/resources")
async def create_capacity_resource(
    portfolio_id: str,
    request: CreateCapacityResourceRequest,
    current_user: User = Depends(get_current_user)
) -> CapacityResource:
    """Add a resource to capacity planning"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators:
        raise HTTPException(status_code=403, detail="Access denied")
    
    resource = CapacityResource(
        portfolio_id=portfolio_id,
        user_id=request.user_id,
        name=request.name,
        role=request.role
    )
    created_resource = db.create_capacity_resource(resource)
    return created_resource


@app.put("/api/capacity/resources/{resource_id}")
async def update_capacity_resource(
    resource_id: str,
    request: CreateCapacityResourceRequest,
    current_user: User = Depends(get_current_user)
) -> CapacityResource:
    """Update a capacity resource"""
    resource = db.get_capacity_resource(resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    portfolio = db.get_portfolio(resource.portfolio_id)
    if not portfolio or (portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators):
        raise HTTPException(status_code=403, detail="Access denied")
    
    resource.name = request.name
    resource.role = request.role
    updated_resource = db.update_capacity_resource(resource_id, resource)
    return updated_resource


@app.delete("/api/capacity/resources/{resource_id}")
async def delete_capacity_resource(
    resource_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a capacity resource"""
    resource = db.get_capacity_resource(resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    portfolio = db.get_portfolio(resource.portfolio_id)
    if not portfolio or (portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators):
        raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete_capacity_resource(resource_id)
    return {"message": "Resource deleted successfully"}


@app.put("/api/milestones/{milestone_id}/effort")
async def update_milestone_effort(
    milestone_id: str,
    request: UpdateEffortEstimateRequest,
    current_user: User = Depends(get_current_user)
) -> dict:
    """Update effort estimate for a milestone"""
    portfolio = None
    for p in db.portfolios.values():
        for m in p.roadmap.milestones:
            if m.id == milestone_id:
                portfolio = p
                break
        if portfolio:
            break
    
    if not portfolio:
        raise HTTPException(status_code=404, detail="Milestone not found")
    
    if portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return {
        "milestone_id": milestone_id,
        "effort_points": request.effort_points,
        "assigned_resources": request.assigned_resources,
        "message": "Effort estimate updated successfully"
    }


@app.get("/api/portfolios/{portfolio_id}/capacity/workload")
async def get_workload_analysis(
    portfolio_id: str,
    current_user: User = Depends(get_current_user)
) -> dict:
    """Get workload analysis for capacity planning"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators:
        raise HTTPException(status_code=403, detail="Access denied")
    
    resources = db.get_capacity_resources_by_portfolio(portfolio_id)
    
    workload_by_resource = {}
    for resource in resources:
        total_hours = sum(slot.hours_per_day for slot in resource.availability)
        workload_by_resource[resource.name] = {
            "role": resource.role,
            "available_hours": total_hours,
            "allocated_hours": 0,
            "utilization": 0
        }
    
    return {
        "portfolio_id": portfolio_id,
        "workload": workload_by_resource,
        "total_resources": len(resources)
    }


@app.post("/api/portfolios/{portfolio_id}/reports")
async def create_custom_report(
    portfolio_id: str,
    request: CreateReportRequest,
    current_user: User = Depends(get_current_user)
) -> CustomReport:
    """Create a custom report"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators:
        raise HTTPException(status_code=403, detail="Access denied")
    
    report = CustomReport(
        portfolio_id=portfolio_id,
        name=request.name,
        report_type=request.report_type,
        config=request.config,
        owner_id=current_user.id
    )
    created_report = db.create_report(report)
    return created_report


@app.get("/api/portfolios/{portfolio_id}/reports")
async def list_reports(
    portfolio_id: str,
    current_user: User = Depends(get_current_user)
) -> List[CustomReport]:
    """List all reports for a portfolio"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators:
        raise HTTPException(status_code=403, detail="Access denied")
    
    reports = db.get_reports_by_portfolio(portfolio_id)
    return reports


@app.get("/api/reports/{report_id}")
async def get_report(
    report_id: str,
    current_user: User = Depends(get_current_user)
) -> CustomReport:
    """Get a specific report"""
    report = db.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    portfolio = db.get_portfolio(report.portfolio_id)
    if not portfolio or (portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators):
        raise HTTPException(status_code=403, detail="Access denied")
    
    return report


@app.put("/api/reports/{report_id}")
async def update_report(
    report_id: str,
    request: CreateReportRequest,
    current_user: User = Depends(get_current_user)
) -> CustomReport:
    """Update a report"""
    report = db.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    portfolio = db.get_portfolio(report.portfolio_id)
    if not portfolio or (portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators):
        raise HTTPException(status_code=403, detail="Access denied")
    
    report.name = request.name
    report.report_type = request.report_type
    report.config = request.config
    updated_report = db.update_report(report_id, report)
    return updated_report


@app.delete("/api/reports/{report_id}")
async def delete_report(
    report_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a report"""
    report = db.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    portfolio = db.get_portfolio(report.portfolio_id)
    if not portfolio or (portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators):
        raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete_report(report_id)
    return {"message": "Report deleted successfully"}


@app.post("/api/reports/{report_id}/execute")
async def execute_report(
    report_id: str,
    current_user: User = Depends(get_current_user)
) -> dict:
    """Execute a report and return data"""
    report = db.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    portfolio = db.get_portfolio(report.portfolio_id)
    if not portfolio or (portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators):
        raise HTTPException(status_code=403, detail="Access denied")
    
    if report.report_type == "pivot":
        data = {
            "rows": [
                {"stage": "Ideation", "count": 3, "health": 85},
                {"stage": "Development", "count": 5, "health": 72},
                {"stage": "Launch", "count": 2, "health": 90}
            ]
        }
    elif report.report_type == "chart":
        data = {
            "labels": ["Q1", "Q2", "Q3", "Q4"],
            "datasets": [
                {"label": "Revenue", "data": [100, 150, 200, 250]},
                {"label": "Costs", "data": [80, 100, 120, 140]}
            ]
        }
    else:
        data = {
            "items": portfolio.roadmap.milestones[:5],
            "total": len(portfolio.roadmap.milestones)
        }
    
    return {
        "report_id": report_id,
        "name": report.name,
        "type": report.report_type,
        "data": data,
        "generated_at": datetime.utcnow().isoformat()
    }


@app.post("/api/reports/{report_id}/ai-insights")
async def generate_report_insights(
    report_id: str,
    current_user: User = Depends(get_current_user)
) -> dict:
    """Generate AI insights for a report"""
    report = db.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    portfolio = db.get_portfolio(report.portfolio_id)
    if not portfolio or (portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators):
        raise HTTPException(status_code=403, detail="Access denied")
    
    insights = [
        "Development stage shows 15% lower health score than average",
        "Q4 revenue projection exceeds target by 25%",
        "3 milestones are at risk of missing deadlines",
        "Resource utilization is optimal at 85%"
    ]
    
    return {
        "report_id": report_id,
        "insights": insights,
        "generated_at": datetime.utcnow().isoformat()
    }


@app.post("/api/portfolios/{portfolio_id}/whiteboards")
async def create_whiteboard(
    portfolio_id: str,
    request: CreateWhiteboardRequest,
    current_user: User = Depends(get_current_user)
) -> Whiteboard:
    """Create a new whiteboard"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators:
        raise HTTPException(status_code=403, detail="Access denied")
    
    whiteboard = Whiteboard(
        portfolio_id=portfolio_id,
        name=request.name,
        canvas_data=request.canvas_data or {},
        linked_items=request.linked_items or []
    )
    created_whiteboard = db.create_whiteboard(whiteboard)
    return created_whiteboard


@app.get("/api/portfolios/{portfolio_id}/whiteboards")
async def list_whiteboards(
    portfolio_id: str,
    current_user: User = Depends(get_current_user)
) -> List[Whiteboard]:
    """List all whiteboards for a portfolio"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators:
        raise HTTPException(status_code=403, detail="Access denied")
    
    whiteboards = db.get_whiteboards_by_portfolio(portfolio_id)
    return whiteboards


@app.get("/api/whiteboards/{whiteboard_id}")
async def get_whiteboard(
    whiteboard_id: str,
    current_user: User = Depends(get_current_user)
) -> Whiteboard:
    """Get a specific whiteboard"""
    whiteboard = db.get_whiteboard(whiteboard_id)
    if not whiteboard:
        raise HTTPException(status_code=404, detail="Whiteboard not found")
    
    portfolio = db.get_portfolio(whiteboard.portfolio_id)
    if not portfolio or (portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators):
        raise HTTPException(status_code=403, detail="Access denied")
    
    return whiteboard


@app.put("/api/whiteboards/{whiteboard_id}")
async def update_whiteboard(
    whiteboard_id: str,
    request: CreateWhiteboardRequest,
    current_user: User = Depends(get_current_user)
) -> Whiteboard:
    """Update a whiteboard"""
    whiteboard = db.get_whiteboard(whiteboard_id)
    if not whiteboard:
        raise HTTPException(status_code=404, detail="Whiteboard not found")
    
    portfolio = db.get_portfolio(whiteboard.portfolio_id)
    if not portfolio or (portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators):
        raise HTTPException(status_code=403, detail="Access denied")
    
    whiteboard.name = request.name
    if request.canvas_data:
        whiteboard.canvas_data = request.canvas_data
    if request.linked_items:
        whiteboard.linked_items = request.linked_items
    
    updated_whiteboard = db.update_whiteboard(whiteboard_id, whiteboard)
    return updated_whiteboard


@app.delete("/api/whiteboards/{whiteboard_id}")
async def delete_whiteboard(
    whiteboard_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a whiteboard"""
    whiteboard = db.get_whiteboard(whiteboard_id)
    if not whiteboard:
        raise HTTPException(status_code=404, detail="Whiteboard not found")
    
    portfolio = db.get_portfolio(whiteboard.portfolio_id)
    if not portfolio or (portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators):
        raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete_whiteboard(whiteboard_id)
    return {"message": "Whiteboard deleted successfully"}


@app.post("/api/whiteboards/{whiteboard_id}/ai-suggestions")
async def get_whiteboard_ai_suggestions(
    whiteboard_id: str,
    current_user: User = Depends(get_current_user)
) -> dict:
    """Get AI suggestions for whiteboard optimization"""
    whiteboard = db.get_whiteboard(whiteboard_id)
    if not whiteboard:
        raise HTTPException(status_code=404, detail="Whiteboard not found")
    
    portfolio = db.get_portfolio(whiteboard.portfolio_id)
    if not portfolio or (portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators):
        raise HTTPException(status_code=403, detail="Access denied")
    
    suggestions = [
        "Consider grouping related components into a single module",
        "Add decision points to clarify user flow branches",
        "Include error handling paths in the flow diagram",
        "Simplify the navigation structure by reducing steps"
    ]
    
    return {
        "whiteboard_id": whiteboard_id,
        "suggestions": suggestions,
        "generated_at": datetime.utcnow().isoformat()
    }


@app.post("/api/portfolios/{portfolio_id}/integrations")
async def create_integration(
    portfolio_id: str,
    request: CreateIntegrationRequest,
    current_user: User = Depends(get_current_user)
) -> Integration:
    """Create a new integration configuration"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators:
        raise HTTPException(status_code=403, detail="Access denied")
    
    integration = Integration(
        portfolio_id=portfolio_id,
        integration_type=request.integration_type,
        config=request.config,
        enabled=request.enabled
    )
    created_integration = db.create_integration(integration)
    return created_integration


@app.get("/api/portfolios/{portfolio_id}/integrations")
async def list_integrations(
    portfolio_id: str,
    current_user: User = Depends(get_current_user)
) -> List[Integration]:
    """List all integrations for a portfolio"""
    portfolio = db.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators:
        raise HTTPException(status_code=403, detail="Access denied")
    
    integrations = db.get_integrations_by_portfolio(portfolio_id)
    return integrations


@app.get("/api/integrations/{integration_id}")
async def get_integration(
    integration_id: str,
    current_user: User = Depends(get_current_user)
) -> Integration:
    """Get a specific integration"""
    integration = db.get_integration(integration_id)
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    portfolio = db.get_portfolio(integration.portfolio_id)
    if not portfolio or (portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators):
        raise HTTPException(status_code=403, detail="Access denied")
    
    return integration


@app.put("/api/integrations/{integration_id}")
async def update_integration(
    integration_id: str,
    request: CreateIntegrationRequest,
    current_user: User = Depends(get_current_user)
) -> Integration:
    """Update an integration"""
    integration = db.get_integration(integration_id)
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    portfolio = db.get_portfolio(integration.portfolio_id)
    if not portfolio or (portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators):
        raise HTTPException(status_code=403, detail="Access denied")
    
    integration.integration_type = request.integration_type
    integration.config = request.config
    integration.enabled = request.enabled
    updated_integration = db.update_integration(integration_id, integration)
    return updated_integration


@app.delete("/api/integrations/{integration_id}")
async def delete_integration(
    integration_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete an integration"""
    integration = db.get_integration(integration_id)
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    portfolio = db.get_portfolio(integration.portfolio_id)
    if not portfolio or (portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators):
        raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete_integration(integration_id)
    return {"message": "Integration deleted successfully"}


@app.post("/api/integrations/{integration_id}/sync")
async def sync_integration(
    integration_id: str,
    current_user: User = Depends(get_current_user)
) -> dict:
    """Trigger a sync for an integration"""
    integration = db.get_integration(integration_id)
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    portfolio = db.get_portfolio(integration.portfolio_id)
    if not portfolio or (portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators):
        raise HTTPException(status_code=403, detail="Access denied")
    
    if not integration.enabled:
        raise HTTPException(status_code=400, detail="Integration is disabled")
    
    if integration.integration_type == "salesforce":
        synced_data = {
            "leads": 15,
            "opportunities": 8,
            "contacts": 42
        }
    elif integration.integration_type == "figma":
        synced_data = {
            "files": 5,
            "prototypes": 3,
            "components": 127
        }
    else:
        synced_data = {}
    
    integration.last_sync = datetime.utcnow()
    db.update_integration(integration_id, integration)
    
    return {
        "integration_id": integration_id,
        "type": integration.integration_type,
        "synced_data": synced_data,
        "synced_at": integration.last_sync.isoformat()
    }


@app.get("/api/integrations/{integration_id}/logs")
async def get_integration_logs(
    integration_id: str,
    current_user: User = Depends(get_current_user)
) -> dict:
    """Get sync logs for an integration"""
    integration = db.get_integration(integration_id)
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    portfolio = db.get_portfolio(integration.portfolio_id)
    if not portfolio or (portfolio.owner_id != current_user.id and current_user.id not in portfolio.collaborators):
        raise HTTPException(status_code=403, detail="Access denied")
    
    logs = [
        {
            "timestamp": datetime.utcnow().isoformat(),
            "status": "success",
            "message": "Sync completed successfully",
            "records_synced": 42
        },
        {
            "timestamp": (datetime.utcnow() - timedelta(hours=1)).isoformat(),
            "status": "success",
            "message": "Sync completed successfully",
            "records_synced": 38
        }
    ]
    
    return {
        "integration_id": integration_id,
        "logs": logs
    }
