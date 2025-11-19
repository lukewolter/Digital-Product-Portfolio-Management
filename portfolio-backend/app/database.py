"""
In-memory database for Portfolio Management v3.0
Data will be lost on server restart - this is a proof of concept
"""
from typing import Dict, List, Optional
from app.models import (
    User, Portfolio, Notification, 
    Idea, CapacityResource, CustomReport, Whiteboard, Integration
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
        
        self._init_mock_data()
    
    def _init_mock_data(self):
        """Initialize with mock data for testing"""
        test_user = User(
            id="test-user-1",
            email="test@example.com",
            name="Test User",
            firebase_uid="test-firebase-uid",
            portfolios=[]
        )
        self.users[test_user.id] = test_user
        self.users[test_user.firebase_uid] = test_user  # Also index by firebase_uid
    
    def get_user_by_firebase_uid(self, firebase_uid: str) -> Optional[User]:
        return self.users.get(firebase_uid)
    
    def get_user_by_id(self, user_id: str) -> Optional[User]:
        return self.users.get(user_id)
    
    def create_user(self, user: User) -> User:
        self.users[user.id] = user
        self.users[user.firebase_uid] = user  # Also index by firebase_uid
        return user
    
    def update_user(self, user_id: str, user: User) -> Optional[User]:
        if user_id in self.users:
            self.users[user_id] = user
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

db = InMemoryDB()
