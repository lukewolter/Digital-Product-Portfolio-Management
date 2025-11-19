"""
In-memory database for Portfolio Management v2.0
Data will be lost on server restart - this is a proof of concept
"""
from typing import Dict, List, Optional
from app.models import User, Portfolio, Notification
from datetime import datetime

class InMemoryDB:
    def __init__(self):
        self.users: Dict[str, User] = {}
        self.portfolios: Dict[str, Portfolio] = {}
        self.notifications: Dict[str, Notification] = {}
        
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

db = InMemoryDB()
