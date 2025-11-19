# v3.0 API Design Document

## Overview
v3.0 adds 5 major features to bridge gaps with Aha!:
1. Ideas Portal - External feedback submission and voting
2. Capacity Planning - Resource allocation and workload visualization
3. Advanced Custom Reporting - Drag-and-drop report builder with AI insights
4. Integrated Whiteboarding - Collaborative canvas for user flows
5. Expanded Integrations - Salesforce and Figma APIs

## New Database Models

### Ideas
```python
class Idea:
    id: str
    portfolio_id: str
    title: str
    description: str
    category: str  # e.g., "Feature Request", "Bug", "Enhancement"
    status: str  # "Submitted", "Under Review", "Planned", "Implemented", "Rejected"
    votes: int
    comments: List[Comment]
    linked_to: Optional[Dict]  # {"type": "milestone", "id": "..."}
    created_by: str  # user email or "anonymous"
    created_at: datetime
    updated_at: datetime
```

### Comment
```python
class Comment:
    id: str
    user: str
    text: str
    created_at: datetime
```

### CapacityResource
```python
class CapacityResource:
    id: str
    portfolio_id: str
    user_id: str
    name: str
    role: str
    availability: List[AvailabilitySlot]
```

### AvailabilitySlot
```python
class AvailabilitySlot:
    start: datetime
    end: datetime
    hours_per_day: float
```

### EffortEstimate
```python
class EffortEstimate:
    milestone_id: str
    effort_points: float
    assigned_resources: List[str]  # resource IDs
```

### CustomReport
```python
class CustomReport:
    id: str
    portfolio_id: str
    name: str
    type: str  # "pivot", "chart", "list"
    config: Dict  # fields, filters, chart type, etc.
    owner_id: str
    created_at: datetime
```

### Whiteboard
```python
class Whiteboard:
    id: str
    portfolio_id: str
    name: str
    linked_to: Optional[Dict]  # {"type": "milestone", "id": "..."}
    data: Dict  # Excalidraw JSON data
    created_at: datetime
    updated_at: datetime
```

### Integration
```python
class Integration:
    id: str
    portfolio_id: str
    type: str  # "salesforce", "figma", "jira", "slack"
    config: Dict  # OAuth tokens, API keys, mappings
    enabled: bool
    last_sync: Optional[datetime]
```

## New API Endpoints

### Ideas Portal APIs
- POST /api/portfolios/{portfolio_id}/ideas - Create new idea
- GET /api/portfolios/{portfolio_id}/ideas - List all ideas (with filters)
- GET /api/ideas/{idea_id} - Get idea details
- PUT /api/ideas/{idea_id} - Update idea (admin only)
- DELETE /api/ideas/{idea_id} - Delete idea (admin only)
- POST /api/ideas/{idea_id}/vote - Upvote an idea
- DELETE /api/ideas/{idea_id}/vote - Remove vote
- POST /api/ideas/{idea_id}/comments - Add comment
- DELETE /api/ideas/{idea_id}/comments/{comment_id} - Delete comment
- POST /api/ideas/{idea_id}/promote - Promote idea to milestone/feature

### Capacity Planning APIs
- GET /api/portfolios/{portfolio_id}/capacity - Get capacity overview
- POST /api/portfolios/{portfolio_id}/capacity/resources - Add resource
- PUT /api/capacity/resources/{resource_id} - Update resource
- DELETE /api/capacity/resources/{resource_id} - Delete resource
- PUT /api/milestones/{milestone_id}/effort - Update effort estimate
- GET /api/portfolios/{portfolio_id}/capacity/workload - Get workload analysis

### Custom Reporting APIs
- POST /api/portfolios/{portfolio_id}/reports - Create custom report
- GET /api/portfolios/{portfolio_id}/reports - List reports
- GET /api/reports/{report_id} - Get report details
- PUT /api/reports/{report_id} - Update report
- DELETE /api/reports/{report_id} - Delete report
- POST /api/reports/{report_id}/execute - Execute report and get data
- GET /api/reports/{report_id}/export - Export report (PDF/Excel)
- POST /api/reports/{report_id}/ai-insights - Get AI-generated insights

### Whiteboarding APIs
- POST /api/portfolios/{portfolio_id}/whiteboards - Create whiteboard
- GET /api/portfolios/{portfolio_id}/whiteboards - List whiteboards
- GET /api/whiteboards/{whiteboard_id} - Get whiteboard data
- PUT /api/whiteboards/{whiteboard_id} - Update whiteboard data
- DELETE /api/whiteboards/{whiteboard_id} - Delete whiteboard
- POST /api/whiteboards/{whiteboard_id}/export - Export as image/PDF
- POST /api/whiteboards/{whiteboard_id}/ai-suggest - Get AI flow suggestions

### Integration APIs
- POST /api/portfolios/{portfolio_id}/integrations - Add integration
- GET /api/portfolios/{portfolio_id}/integrations - List integrations
- PUT /api/integrations/{integration_id} - Update integration config
- DELETE /api/integrations/{integration_id} - Remove integration
- POST /api/integrations/{integration_id}/sync - Trigger manual sync
- GET /api/integrations/salesforce/auth - OAuth flow for Salesforce
- GET /api/integrations/figma/auth - OAuth flow for Figma
- POST /api/integrations/salesforce/pull - Pull CRM data
- POST /api/integrations/figma/embed - Embed Figma prototype

## WebSocket Events (Real-time)

### Ideas Portal
- idea:created - New idea submitted
- idea:voted - Vote added/removed
- idea:commented - New comment added
- idea:updated - Idea status/details updated

### Whiteboarding
- whiteboard:updated - Canvas data changed
- whiteboard:cursor - User cursor position
- whiteboard:user-joined - User joined whiteboard
- whiteboard:user-left - User left whiteboard

## Frontend Components

### New Tabs/Routes
1. /ideas-portal - Public ideas portal (can be embedded)
2. /capacity - Capacity planning dashboard
3. /reports - Custom reports builder and viewer
4. /whiteboards - Whiteboard gallery

### New Components
- IdeasPortalTab - Ideas submission, voting, moderation
- CapacityPlannerTab - Resource calendar, workload charts
- ReportBuilderTab - Drag-and-drop report builder
- WhiteboardCanvas - Excalidraw integration
- IntegrationsTab - Configure Salesforce, Figma, etc.

## Libraries to Add

### Backend
- jsforce (Salesforce API)
- figma-api (Figma API)
- reportlab or weasyprint (PDF generation)
- openpyxl (Excel export)

### Frontend
- @excalidraw/excalidraw (Whiteboarding)
- ag-grid-react or @tanstack/react-table (Advanced tables/pivots)
- recharts (already available, use for advanced charts)
- react-big-calendar (Capacity calendar)
- react-beautiful-dnd (Drag-and-drop for report builder)

## Implementation Order
1. Backend: Add new models and database schemas
2. Backend: Implement Ideas Portal APIs
3. Frontend: Build Ideas Portal UI
4. Backend: Implement Capacity Planning APIs
5. Frontend: Build Capacity Planning UI
6. Backend: Implement Custom Reporting APIs
7. Frontend: Build Report Builder UI
8. Backend: Implement Whiteboarding APIs
9. Frontend: Integrate Excalidraw
10. Backend: Implement Integration APIs (Salesforce, Figma)
11. Frontend: Build Integrations configuration UI
12. Testing: Test all features locally
13. Deployment: Deploy v3.0 to production
