from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from datetime import datetime

from app.models import (
    Portfolio, User, CreatePortfolioRequest, UpdateBusinessCaseRequest,
    Competitor, Persona, Milestone, FundingSource, KPI, CreateMilestoneRequest,
    UpdateInvestmentRequest, CreateFeedbackRequest, Feedback
)
from app.database import db

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
