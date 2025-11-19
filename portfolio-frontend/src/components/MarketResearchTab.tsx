import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, MessageSquare } from 'lucide-react';
import { apiClient } from '../lib/api';

interface Competitor {
  id: string;
  name: string;
  strengths: string;
  weaknesses: string;
}

interface Persona {
  id: string;
  demographics: string;
  pain_points: string;
}

interface Feedback {
  id: string;
  source: string;
  text: string;
  sentiment: number;
  sentiment_label: string;
  linked_section?: string;
}

interface MarketResearchTabProps {
  portfolioId: string;
  competitors: Competitor[];
  personas: Persona[];
  feedback?: Feedback[];
  onUpdate: () => void;
}

export function MarketResearchTab({ portfolioId, competitors, personas, feedback = [], onUpdate }: MarketResearchTabProps) {
  const [newCompetitor, setNewCompetitor] = useState({ name: '', strengths: '', weaknesses: '' });
  const [newPersona, setNewPersona] = useState({ demographics: '', pain_points: '' });
  const [newFeedback, setNewFeedback] = useState({ source: '', text: '', linked_section: '' });

  const handleAddCompetitor = async () => {
    if (!newCompetitor.name.trim()) return;
    
    try {
      await apiClient.addCompetitor(portfolioId, newCompetitor);
      setNewCompetitor({ name: '', strengths: '', weaknesses: '' });
      onUpdate();
    } catch (error) {
      console.error('Failed to add competitor:', error);
    }
  };

  const handleDeleteCompetitor = async (competitorId: string) => {
    try {
      await apiClient.deleteCompetitor(portfolioId, competitorId);
      onUpdate();
    } catch (error) {
      console.error('Failed to delete competitor:', error);
    }
  };

  const handleAddPersona = async () => {
    if (!newPersona.demographics.trim()) return;
    
    try {
      await apiClient.addPersona(portfolioId, newPersona);
      setNewPersona({ demographics: '', pain_points: '' });
      onUpdate();
    } catch (error) {
      console.error('Failed to add persona:', error);
    }
  };

  const handleDeletePersona = async (personaId: string) => {
    try {
      await apiClient.deletePersona(portfolioId, personaId);
      onUpdate();
    } catch (error) {
      console.error('Failed to delete persona:', error);
    }
  };

  const handleAddFeedback = async () => {
    if (!newFeedback.source.trim() || !newFeedback.text.trim()) return;
    
    try {
      await apiClient.addFeedback(portfolioId, newFeedback);
      setNewFeedback({ source: '', text: '', linked_section: '' });
      onUpdate();
    } catch (error) {
      console.error('Failed to add feedback:', error);
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    try {
      await apiClient.deleteFeedback(portfolioId, feedbackId);
      onUpdate();
    } catch (error) {
      console.error('Failed to delete feedback:', error);
    }
  };

  const getSentimentColor = (label: string) => {
    switch (label) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Competitors Section */}
      <Card>
        <CardHeader>
          <CardTitle>Competitors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Competitor Name</Label>
              <Input
                value={newCompetitor.name}
                onChange={(e) => setNewCompetitor({ ...newCompetitor, name: e.target.value })}
                placeholder="e.g., Competitor A"
              />
            </div>
            <div>
              <Label>Strengths</Label>
              <Input
                value={newCompetitor.strengths}
                onChange={(e) => setNewCompetitor({ ...newCompetitor, strengths: e.target.value })}
                placeholder="Key strengths"
              />
            </div>
            <div>
              <Label>Weaknesses</Label>
              <Input
                value={newCompetitor.weaknesses}
                onChange={(e) => setNewCompetitor({ ...newCompetitor, weaknesses: e.target.value })}
                placeholder="Key weaknesses"
              />
            </div>
          </div>
          <Button onClick={handleAddCompetitor}>
            <Plus className="w-4 h-4 mr-2" />
            Add Competitor
          </Button>

          {competitors.length > 0 && (
            <div className="mt-6 space-y-3">
              {competitors.map((competitor) => (
                <Card key={competitor.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-2">{competitor.name}</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-green-600">Strengths:</span>
                            <p className="text-gray-600 mt-1">{competitor.strengths}</p>
                          </div>
                          <div>
                            <span className="font-medium text-red-600">Weaknesses:</span>
                            <p className="text-gray-600 mt-1">{competitor.weaknesses}</p>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCompetitor(competitor.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Personas Section */}
      <Card>
        <CardHeader>
          <CardTitle>User Personas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Demographics</Label>
              <Textarea
                value={newPersona.demographics}
                onChange={(e) => setNewPersona({ ...newPersona, demographics: e.target.value })}
                placeholder="Age, location, occupation, etc."
                rows={3}
              />
            </div>
            <div>
              <Label>Pain Points</Label>
              <Textarea
                value={newPersona.pain_points}
                onChange={(e) => setNewPersona({ ...newPersona, pain_points: e.target.value })}
                placeholder="Key challenges and needs"
                rows={3}
              />
            </div>
          </div>
          <Button onClick={handleAddPersona}>
            <Plus className="w-4 h-4 mr-2" />
            Add Persona
          </Button>

          {personas.length > 0 && (
            <div className="mt-6 space-y-3">
              {personas.map((persona) => (
                <Card key={persona.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Demographics:</span>
                            <p className="text-gray-600 mt-1">{persona.demographics}</p>
                          </div>
                          <div>
                            <span className="font-medium">Pain Points:</span>
                            <p className="text-gray-600 mt-1">{persona.pain_points}</p>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePersona(persona.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer Feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Source</Label>
              <Input
                value={newFeedback.source}
                onChange={(e) => setNewFeedback({ ...newFeedback, source: e.target.value })}
                placeholder="e.g., Customer Survey, Support Ticket"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Feedback Text</Label>
              <Textarea
                value={newFeedback.text}
                onChange={(e) => setNewFeedback({ ...newFeedback, text: e.target.value })}
                placeholder="Enter customer feedback..."
                rows={2}
              />
            </div>
          </div>
          <Button onClick={handleAddFeedback}>
            <Plus className="w-4 h-4 mr-2" />
            Add Feedback
          </Button>

          {feedback.length > 0 && (
            <div className="mt-6 space-y-3">
              {feedback.map((fb) => (
                <Card key={fb.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">{fb.source}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getSentimentColor(fb.sentiment_label)}`}>
                            {fb.sentiment_label}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">{fb.text}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteFeedback(fb.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
