import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';

import { Add, Delete, Edit } from '@mui/icons-material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { usePortfolio } from '../context/PortfolioContext';
import { Competitor, Persona } from '../types';
import { v4 as uuidv4 } from 'uuid';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const MarketResearchTab: React.FC = () => {
  const { currentPortfolio, dispatch } = usePortfolio();
  const [competitorName, setCompetitorName] = useState('');
  const [competitorStrengths, setCompetitorStrengths] = useState('');
  const [competitorWeaknesses, setCompetitorWeaknesses] = useState('');
  const [editingCompetitorId, setEditingCompetitorId] = useState<string | null>(null);

  const [personaDemographics, setPersonaDemographics] = useState('');
  const [personaPainPoints, setPersonaPainPoints] = useState('');
  const [editingPersonaId, setEditingPersonaId] = useState<string | null>(null);

  useEffect(() => {
    if (currentPortfolio && currentPortfolio.marketResearch.competitors.length === 0) {
      const mockCompetitors: Competitor[] = [
        {
          id: uuidv4(),
          name: 'Competitor A',
          strengths: 'Established brand, Large customer base',
          weaknesses: 'High prices, Slow innovation',
        },
        {
          id: uuidv4(),
          name: 'Competitor B',
          strengths: 'Modern technology, Good UX',
          weaknesses: 'Limited features, New to market',
        },
      ];

      const mockPersonas: Persona[] = [
        {
          id: uuidv4(),
          demographics: 'Small business owners, 30-50 years old',
          painPoints: 'Limited budget, Need simple solutions',
        },
      ];

      const chartData = {
        labels: ['Competitor A', 'Competitor B', 'Our Product'],
        datasets: [
          {
            label: 'Market Share (%)',
            data: [35, 25, 15],
            backgroundColor: ['rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)', 'rgba(75, 192, 192, 0.5)'],
          },
        ],
      };

      dispatch({
        type: 'UPDATE_PORTFOLIO',
        payload: {
          ...currentPortfolio,
          marketResearch: {
            competitors: mockCompetitors,
            personas: mockPersonas,
            chartData,
          },
        },
      });
    }
  }, [currentPortfolio?.id]);

  const handleAddCompetitor = () => {
    if (!currentPortfolio || !competitorName.trim()) return;

    const newCompetitor: Competitor = {
      id: uuidv4(),
      name: competitorName,
      strengths: competitorStrengths,
      weaknesses: competitorWeaknesses,
    };

    const updatedCompetitors = editingCompetitorId
      ? currentPortfolio.marketResearch.competitors.map((c) =>
          c.id === editingCompetitorId ? { ...newCompetitor, id: editingCompetitorId } : c
        )
      : [...currentPortfolio.marketResearch.competitors, newCompetitor];

    dispatch({
      type: 'UPDATE_PORTFOLIO',
      payload: {
        ...currentPortfolio,
        marketResearch: {
          ...currentPortfolio.marketResearch,
          competitors: updatedCompetitors,
        },
      },
    });

    setCompetitorName('');
    setCompetitorStrengths('');
    setCompetitorWeaknesses('');
    setEditingCompetitorId(null);
  };

  const handleEditCompetitor = (competitor: Competitor) => {
    setCompetitorName(competitor.name);
    setCompetitorStrengths(competitor.strengths);
    setCompetitorWeaknesses(competitor.weaknesses);
    setEditingCompetitorId(competitor.id);
  };

  const handleDeleteCompetitor = (id: string) => {
    if (!currentPortfolio) return;

    dispatch({
      type: 'UPDATE_PORTFOLIO',
      payload: {
        ...currentPortfolio,
        marketResearch: {
          ...currentPortfolio.marketResearch,
          competitors: currentPortfolio.marketResearch.competitors.filter((c) => c.id !== id),
        },
      },
    });
  };

  const handleAddPersona = () => {
    if (!currentPortfolio || !personaDemographics.trim()) return;

    const newPersona: Persona = {
      id: uuidv4(),
      demographics: personaDemographics,
      painPoints: personaPainPoints,
    };

    const updatedPersonas = editingPersonaId
      ? currentPortfolio.marketResearch.personas.map((p) =>
          p.id === editingPersonaId ? { ...newPersona, id: editingPersonaId } : p
        )
      : [...currentPortfolio.marketResearch.personas, newPersona];

    dispatch({
      type: 'UPDATE_PORTFOLIO',
      payload: {
        ...currentPortfolio,
        marketResearch: {
          ...currentPortfolio.marketResearch,
          personas: updatedPersonas,
        },
      },
    });

    setPersonaDemographics('');
    setPersonaPainPoints('');
    setEditingPersonaId(null);
  };

  const handleEditPersona = (persona: Persona) => {
    setPersonaDemographics(persona.demographics);
    setPersonaPainPoints(persona.painPoints);
    setEditingPersonaId(persona.id);
  };

  const handleDeletePersona = (id: string) => {
    if (!currentPortfolio) return;

    dispatch({
      type: 'UPDATE_PORTFOLIO',
      payload: {
        ...currentPortfolio,
        marketResearch: {
          ...currentPortfolio.marketResearch,
          personas: currentPortfolio.marketResearch.personas.filter((p) => p.id !== id),
        },
      },
    });
  };

  if (!currentPortfolio) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="text.secondary">
          Please create or select a portfolio to get started
        </Typography>
      </Box>
    );
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Market Share Analysis',
      },
    },
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Market Research
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ flex: "1 1 calc(50% - 8px)", minWidth: "300px" }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Competitors
              </Typography>

              <TextField
                fullWidth
                label="Competitor Name"
                value={competitorName}
                onChange={(e) => setCompetitorName(e.target.value)}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Strengths"
                multiline
                rows={2}
                value={competitorStrengths}
                onChange={(e) => setCompetitorStrengths(e.target.value)}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Weaknesses"
                multiline
                rows={2}
                value={competitorWeaknesses}
                onChange={(e) => setCompetitorWeaknesses(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Button
                variant="contained"
                startIcon={editingCompetitorId ? <Edit /> : <Add />}
                onClick={handleAddCompetitor}
                fullWidth
              >
                {editingCompetitorId ? 'Update Competitor' : 'Add Competitor'}
              </Button>

              <List sx={{ mt: 2 }}>
                {currentPortfolio.marketResearch.competitors.map((competitor) => (
                  <React.Fragment key={competitor.id}>
                    <ListItem
                      secondaryAction={
                        <Box>
                          <IconButton edge="end" onClick={() => handleEditCompetitor(competitor)}>
                            <Edit />
                          </IconButton>
                          <IconButton edge="end" onClick={() => handleDeleteCompetitor(competitor.id)}>
                            <Delete />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={competitor.name}
                        secondary={
                          <>
                            <Typography variant="body2" color="success.main">
                              Strengths: {competitor.strengths}
                            </Typography>
                            <Typography variant="body2" color="error.main">
                              Weaknesses: {competitor.weaknesses}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: "1 1 calc(50% - 8px)", minWidth: "300px" }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Personas
              </Typography>

              <TextField
                fullWidth
                label="Demographics"
                multiline
                rows={2}
                value={personaDemographics}
                onChange={(e) => setPersonaDemographics(e.target.value)}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Pain Points"
                multiline
                rows={2}
                value={personaPainPoints}
                onChange={(e) => setPersonaPainPoints(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Button
                variant="contained"
                startIcon={editingPersonaId ? <Edit /> : <Add />}
                onClick={handleAddPersona}
                fullWidth
              >
                {editingPersonaId ? 'Update Persona' : 'Add Persona'}
              </Button>

              <List sx={{ mt: 2 }}>
                {currentPortfolio.marketResearch.personas.map((persona) => (
                  <React.Fragment key={persona.id}>
                    <ListItem
                      secondaryAction={
                        <Box>
                          <IconButton edge="end" onClick={() => handleEditPersona(persona)}>
                            <Edit />
                          </IconButton>
                          <IconButton edge="end" onClick={() => handleDeletePersona(persona.id)}>
                            <Delete />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={persona.demographics}
                        secondary={`Pain Points: ${persona.painPoints}`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: "1 1 100%" }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Market Share Visualization
              </Typography>
              <Box sx={{ height: 400 }}>
                <Bar options={chartOptions} data={currentPortfolio.marketResearch.chartData} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};
