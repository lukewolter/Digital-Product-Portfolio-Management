import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
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

interface MarketResearchTabProps {
  portfolioId: string;
  competitors: Competitor[];
  personas: Persona[];
  onUpdate: () => void;
}

export function MarketResearchTab({ portfolioId, competitors, personas, onUpdate }: MarketResearchTabProps) {
  const [newCompetitor, setNewCompetitor] = useState({ name: '', strengths: '', weaknesses: '' });
  const [newPersona, setNewPersona] = useState({ demographics: '', pain_points: '' });

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
    </div>
  );
}
