# Portfolio Management v2.0 API Design

## Authentication Endpoints
- POST /api/auth/verify - Verify Firebase token and get/create user
- GET /api/auth/me - Get current user info

## Portfolio Endpoints
- GET /api/portfolios - List all portfolios for authenticated user
- POST /api/portfolios - Create new portfolio
- GET /api/portfolios/{id} - Get portfolio details
- PUT /api/portfolios/{id} - Update portfolio
- DELETE /api/portfolios/{id} - Delete portfolio
- GET /api/portfolios/{id}/versions - Get version history
- POST /api/portfolios/{id}/versions/{version_id}/restore - Restore version

## Business Case Endpoints
- PUT /api/portfolios/{id}/business-case - Update business case
- GET /api/portfolios/{id}/business-case/history - Get business case history

## Market Research Endpoints
- POST /api/portfolios/{id}/competitors - Add competitor
- PUT /api/portfolios/{id}/competitors/{competitor_id} - Update competitor
- DELETE /api/portfolios/{id}/competitors/{competitor_id} - Delete competitor
- POST /api/portfolios/{id}/personas - Add persona
- PUT /api/portfolios/{id}/personas/{persona_id} - Update persona
- DELETE /api/portfolios/{id}/personas/{persona_id} - Delete persona
- POST /api/portfolios/{id}/feedback - Add customer feedback
- GET /api/portfolios/{id}/feedback - List feedback with sentiment analysis

## Roadmap Endpoints
- POST /api/portfolios/{id}/milestones - Add milestone
- PUT /api/portfolios/{id}/milestones/{milestone_id} - Update milestone
- DELETE /api/portfolios/{id}/milestones/{milestone_id} - Delete milestone
- PUT /api/portfolios/{id}/milestones/reorder - Reorder milestones

## Investment Planning Endpoints
- PUT /api/portfolios/{id}/investment - Update investment data
- POST /api/portfolios/{id}/funding - Add funding source
- DELETE /api/portfolios/{id}/funding/{funding_id} - Delete funding source
- POST /api/portfolios/{id}/investment/scenarios - Run scenario analysis

## Product Lifecycle Endpoints
- PUT /api/portfolios/{id}/lifecycle/stage - Update lifecycle stage
- POST /api/portfolios/{id}/kpis - Add KPI
- PUT /api/portfolios/{id}/kpis/{kpi_id} - Update KPI
- DELETE /api/portfolios/{id}/kpis/{kpi_id} - Delete KPI
- POST /api/portfolios/{id}/reminders - Add reminder
- DELETE /api/portfolios/{id}/reminders/{reminder_id} - Delete reminder

## AI Assistance Endpoints
- POST /api/ai/prioritize-milestones - Get AI suggestions for milestone prioritization (RICE scoring)
- POST /api/ai/generate-scenarios - Generate ROI scenarios

## Analytics Endpoints
- GET /api/analytics/overview - Get portfolio-level aggregated analytics
- GET /api/analytics/health-score/{id} - Calculate portfolio health score
- GET /api/analytics/kpi-trends - Get KPI trends across portfolios

## Integration Endpoints
- GET /api/integrations/jira/auth - Initiate Jira OAuth flow
- POST /api/integrations/jira/sync - Sync milestones with Jira
- POST /api/integrations/slack/notify - Send Slack notification

## Export Endpoints
- POST /api/export/pdf - Generate PDF export
- POST /api/export/csv - Generate CSV export
- POST /api/export/summary - Generate JSON summary

## Notification Endpoints
- GET /api/notifications - Get user notifications
- PUT /api/notifications/{id}/read - Mark notification as read
- POST /api/notifications/settings - Update notification settings

## Collaboration Endpoints (WebSocket)
- WS /ws/portfolio/{id} - Real-time collaboration channel
  - Events: user_joined, user_left, data_updated, cursor_moved

## Data Models

### User
```python
{
    "id": str,
    "email": str,
    "name": str,
    "created_at": datetime,
    "portfolios": [str]  # portfolio IDs
}
```

### Portfolio
```python
{
    "id": str,
    "name": str,
    "description": str,
    "owner_id": str,
    "collaborators": [str],  # user IDs
    "business_case": BusinessCase,
    "market_research": MarketResearch,
    "roadmap": Roadmap,
    "investment": Investment,
    "lifecycle": Lifecycle,
    "versions": [Version],
    "created_at": datetime,
    "updated_at": datetime
}
```

### Version
```python
{
    "id": str,
    "timestamp": datetime,
    "user_id": str,
    "changes": dict,
    "snapshot": dict
}
```

### Feedback
```python
{
    "id": str,
    "source": str,
    "text": str,
    "sentiment": float,  # -1 to 1
    "created_at": datetime
}
```

### Notification
```python
{
    "id": str,
    "user_id": str,
    "portfolio_id": str,
    "type": str,  # reminder, milestone_due, etc.
    "message": str,
    "read": bool,
    "created_at": datetime
}
```
