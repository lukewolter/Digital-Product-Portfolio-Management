import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
} from '@mui/material';

import { Add, Delete } from '@mui/icons-material';
import { usePortfolio } from '../context/PortfolioContext';
import { KPI, LifecycleStage } from '../types';
import { v4 as uuidv4 } from 'uuid';

const lifecycleStages: LifecycleStage[] = ['Ideation', 'Development', 'Launch', 'Growth', 'Maturity', 'Retirement'];

export const ProductLifecycleTab: React.FC = () => {
  const { currentPortfolio, dispatch } = usePortfolio();
  const [kpiMetric, setKpiMetric] = useState('');
  const [kpiValue, setKpiValue] = useState('');
  const [reminder, setReminder] = useState('');

  const handleStageClick = (stage: LifecycleStage) => {
    if (!currentPortfolio) return;

    dispatch({
      type: 'UPDATE_PORTFOLIO',
      payload: {
        ...currentPortfolio,
        lifecycle: {
          ...currentPortfolio.lifecycle,
          currentStage: stage,
        },
      },
    });
  };

  const handleAddKPI = () => {
    if (!currentPortfolio || !kpiMetric.trim() || !kpiValue) return;

    const newKPI: KPI = {
      id: uuidv4(),
      metric: kpiMetric,
      value: parseFloat(kpiValue),
    };

    dispatch({
      type: 'UPDATE_PORTFOLIO',
      payload: {
        ...currentPortfolio,
        lifecycle: {
          ...currentPortfolio.lifecycle,
          kpis: [...currentPortfolio.lifecycle.kpis, newKPI],
        },
      },
    });

    setKpiMetric('');
    setKpiValue('');
  };

  const handleDeleteKPI = (id: string) => {
    if (!currentPortfolio) return;

    dispatch({
      type: 'UPDATE_PORTFOLIO',
      payload: {
        ...currentPortfolio,
        lifecycle: {
          ...currentPortfolio.lifecycle,
          kpis: currentPortfolio.lifecycle.kpis.filter((k) => k.id !== id),
        },
      },
    });
  };

  const handleAddReminder = () => {
    if (!currentPortfolio || !reminder.trim()) return;

    dispatch({
      type: 'UPDATE_PORTFOLIO',
      payload: {
        ...currentPortfolio,
        lifecycle: {
          ...currentPortfolio.lifecycle,
          reminders: [...currentPortfolio.lifecycle.reminders, reminder],
        },
      },
    });

    setReminder('');
  };

  const handleDeleteReminder = (index: number) => {
    if (!currentPortfolio) return;

    dispatch({
      type: 'UPDATE_PORTFOLIO',
      payload: {
        ...currentPortfolio,
        lifecycle: {
          ...currentPortfolio.lifecycle,
          reminders: currentPortfolio.lifecycle.reminders.filter((_, i) => i !== index),
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

  const currentStageIndex = lifecycleStages.indexOf(currentPortfolio.lifecycle.currentStage as LifecycleStage);
  const progress = ((currentStageIndex + 1) / lifecycleStages.length) * 100;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Product Lifecycle
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Lifecycle Stage Tracker
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Current Stage: <strong>{currentPortfolio.lifecycle.currentStage}</strong>
          </Typography>

          <Box sx={{ mb: 2 }}>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {lifecycleStages.map((stage) => (
              <Chip
                key={stage}
                label={stage}
                onClick={() => handleStageClick(stage)}
                color={currentPortfolio.lifecycle.currentStage === stage ? 'primary' : 'default'}
                variant={currentPortfolio.lifecycle.currentStage === stage ? 'filled' : 'outlined'}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ flex: "1 1 calc(50% - 8px)", minWidth: "300px" }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Key Performance Indicators (KPIs)
              </Typography>

              <TextField
                fullWidth
                label="Metric Name"
                value={kpiMetric}
                onChange={(e) => setKpiMetric(e.target.value)}
                sx={{ mb: 2 }}
                placeholder="e.g., Active Users, Churn Rate"
              />

              <TextField
                fullWidth
                label="Value"
                type="number"
                value={kpiValue}
                onChange={(e) => setKpiValue(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Button variant="contained" startIcon={<Add />} onClick={handleAddKPI} fullWidth>
                Add KPI
              </Button>

              <List sx={{ mt: 2 }}>
                {currentPortfolio.lifecycle.kpis.length === 0 ? (
                  <ListItem>
                    <ListItemText secondary="No KPIs added yet" />
                  </ListItem>
                ) : (
                  currentPortfolio.lifecycle.kpis.map((kpi) => (
                    <ListItem
                      key={kpi.id}
                      secondaryAction={
                        <IconButton edge="end" onClick={() => handleDeleteKPI(kpi.id)}>
                          <Delete />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={kpi.metric}
                        secondary={`Value: ${kpi.value.toLocaleString()}`}
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: "1 1 calc(50% - 8px)", minWidth: "300px" }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Reminders & Tasks
              </Typography>

              <TextField
                fullWidth
                label="Reminder"
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
                sx={{ mb: 2 }}
                placeholder="e.g., Review metrics in 3 months"
              />

              <Button variant="contained" startIcon={<Add />} onClick={handleAddReminder} fullWidth>
                Add Reminder
              </Button>

              <List sx={{ mt: 2 }}>
                {currentPortfolio.lifecycle.reminders.length === 0 ? (
                  <ListItem>
                    <ListItemText secondary="No reminders added yet" />
                  </ListItem>
                ) : (
                  currentPortfolio.lifecycle.reminders.map((rem, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <IconButton edge="end" onClick={() => handleDeleteReminder(index)}>
                          <Delete />
                        </IconButton>
                      }
                    >
                      <ListItemText primary={rem} />
                    </ListItem>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Stage-Specific Guidance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {currentPortfolio.lifecycle.currentStage === 'Ideation' && (
              'Focus on validating your idea, conducting market research, and defining your value proposition.'
            )}
            {currentPortfolio.lifecycle.currentStage === 'Development' && (
              'Build your MVP, gather early feedback, and iterate on your product based on user input.'
            )}
            {currentPortfolio.lifecycle.currentStage === 'Launch' && (
              'Execute your go-to-market strategy, acquire initial users, and monitor key metrics closely.'
            )}
            {currentPortfolio.lifecycle.currentStage === 'Growth' && (
              'Scale your user base, optimize conversion funnels, and expand your feature set based on demand.'
            )}
            {currentPortfolio.lifecycle.currentStage === 'Maturity' && (
              'Maintain market position, focus on retention, and explore new revenue streams or markets.'
            )}
            {currentPortfolio.lifecycle.currentStage === 'Retirement' && (
              'Plan for product sunset, migrate users to alternatives, and document lessons learned.'
            )}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
