"""
AI-assisted prioritization using RICE scoring
(Reach, Impact, Confidence, Effort)
"""
from typing import List, Dict
import os

def calculate_rice_score(reach: float, impact: float, confidence: float, effort: float) -> float:
    """
    Calculate RICE score: (Reach × Impact × Confidence) / Effort
    
    Args:
        reach: Number of people/customers affected (0-100)
        impact: Impact level (1=minimal, 2=low, 3=medium, 4=high, 5=massive)
        confidence: Confidence percentage (0-100)
        effort: Effort in person-months (0.1-100)
    
    Returns:
        RICE score (higher is better)
    """
    if effort == 0:
        effort = 0.1  # Avoid division by zero
    
    confidence_decimal = confidence / 100.0
    return (reach * impact * confidence_decimal) / effort

def prioritize_milestones(milestones: List[Dict]) -> List[Dict]:
    """
    Prioritize milestones using RICE scoring
    
    For POC, uses simple heuristics. In production, would use OpenAI API.
    """
    scored_milestones = []
    
    for milestone in milestones:
        title = milestone.get('title', '').lower()
        description = milestone.get('description', '').lower()
        
        reach = estimate_reach(title, description)
        impact = estimate_impact(title, description)
        confidence = estimate_confidence(milestone)
        effort = estimate_effort(title, description)
        
        rice_score = calculate_rice_score(reach, impact, confidence, effort)
        
        scored_milestones.append({
            **milestone,
            'rice_score': round(rice_score, 2),
            'rice_components': {
                'reach': reach,
                'impact': impact,
                'confidence': confidence,
                'effort': effort
            }
        })
    
    scored_milestones.sort(key=lambda x: x['rice_score'], reverse=True)
    
    return scored_milestones

def estimate_reach(title: str, description: str) -> float:
    """Estimate reach based on keywords"""
    high_reach_keywords = ['all users', 'everyone', 'platform', 'core', 'critical']
    medium_reach_keywords = ['users', 'customers', 'feature']
    
    text = f"{title} {description}"
    
    if any(keyword in text for keyword in high_reach_keywords):
        return 80.0
    elif any(keyword in text for keyword in medium_reach_keywords):
        return 50.0
    else:
        return 30.0

def estimate_impact(title: str, description: str) -> float:
    """Estimate impact (1-5 scale)"""
    high_impact_keywords = ['revenue', 'critical', 'security', 'performance', 'scale']
    medium_impact_keywords = ['improve', 'enhance', 'optimize', 'feature']
    
    text = f"{title} {description}"
    
    if any(keyword in text for keyword in high_impact_keywords):
        return 5.0
    elif any(keyword in text for keyword in medium_impact_keywords):
        return 3.0
    else:
        return 2.0

def estimate_confidence(milestone: Dict) -> float:
    """Estimate confidence based on milestone completeness"""
    has_date = bool(milestone.get('date'))
    has_description = bool(milestone.get('description'))
    has_dependencies = bool(milestone.get('dependencies'))
    
    confidence = 50.0  # Base confidence
    if has_date:
        confidence += 20.0
    if has_description:
        confidence += 20.0
    if has_dependencies:
        confidence += 10.0
    
    return min(confidence, 100.0)

def estimate_effort(title: str, description: str) -> float:
    """Estimate effort in person-months"""
    high_effort_keywords = ['platform', 'infrastructure', 'migration', 'refactor']
    medium_effort_keywords = ['feature', 'integration', 'implement']
    low_effort_keywords = ['fix', 'update', 'improve', 'enhance']
    
    text = f"{title} {description}"
    
    if any(keyword in text for keyword in high_effort_keywords):
        return 6.0  # 6 person-months
    elif any(keyword in text for keyword in medium_effort_keywords):
        return 3.0  # 3 person-months
    elif any(keyword in text for keyword in low_effort_keywords):
        return 1.0  # 1 person-month
    else:
        return 2.0  # Default

def generate_roi_scenarios(budget: float, revenue: float, multipliers: List[float] = None) -> List[Dict]:
    """
    Generate ROI scenarios with different multipliers
    
    Args:
        budget: Initial budget
        revenue: Expected revenue
        multipliers: List of scenario multipliers (default: [0.5, 1.0, 1.5, 2.0])
    
    Returns:
        List of scenario dictionaries with ROI and NPV
    """
    if multipliers is None:
        multipliers = [0.5, 1.0, 1.5, 2.0]
    
    scenarios = []
    scenario_names = ['Pessimistic', 'Realistic', 'Optimistic', 'Best Case']
    
    for i, multiplier in enumerate(multipliers):
        adjusted_revenue = revenue * multiplier
        roi = ((adjusted_revenue - budget) / budget * 100) if budget > 0 else 0
        npv = adjusted_revenue - budget
        
        scenarios.append({
            'name': scenario_names[i] if i < len(scenario_names) else f'Scenario {i+1}',
            'multiplier': multiplier,
            'revenue': round(adjusted_revenue, 2),
            'roi': round(roi, 2),
            'npv': round(npv, 2)
        })
    
    return scenarios

def analyze_feedback_sentiment(feedback_text: str) -> Dict:
    """
    Analyze sentiment of feedback text
    
    For POC, uses simple keyword matching. In production, would use NLP library or API.
    """
    positive_keywords = ['great', 'excellent', 'love', 'amazing', 'perfect', 'good', 'helpful']
    negative_keywords = ['bad', 'terrible', 'hate', 'awful', 'poor', 'broken', 'issue', 'problem']
    
    text_lower = feedback_text.lower()
    
    positive_count = sum(1 for keyword in positive_keywords if keyword in text_lower)
    negative_count = sum(1 for keyword in negative_keywords if keyword in text_lower)
    
    total_keywords = positive_count + negative_count
    if total_keywords == 0:
        sentiment_score = 0.0
        sentiment_label = 'neutral'
    else:
        sentiment_score = (positive_count - negative_count) / total_keywords
        if sentiment_score > 0.3:
            sentiment_label = 'positive'
        elif sentiment_score < -0.3:
            sentiment_label = 'negative'
        else:
            sentiment_label = 'neutral'
    
    return {
        'score': round(sentiment_score, 2),
        'label': sentiment_label,
        'positive_keywords': positive_count,
        'negative_keywords': negative_count
    }
