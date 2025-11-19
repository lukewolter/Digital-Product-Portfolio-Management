import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';

import { Edit } from '@mui/icons-material';
import { usePortfolio } from '../context/PortfolioContext';
import { BusinessCase } from '../types';

const templates = {
  blank: {
    problem: '',
    valueProp: '',
    swot: { strengths: '', weaknesses: '', opportunities: '', threats: '' },
  },
  startup: {
    problem: 'Small businesses struggle with managing customer relationships efficiently',
    valueProp: 'Affordable, easy-to-use CRM that helps small businesses grow customer loyalty',
    swot: {
      strengths: 'Low cost, Simple UI, Fast setup',
      weaknesses: 'Limited features compared to enterprise solutions, Small team',
      opportunities: 'Growing small business market, Increasing digital adoption',
      threats: 'Competition from established players, Economic downturn',
    },
  },
  saas: {
    problem: 'Teams waste time switching between multiple productivity tools',
    valueProp: 'All-in-one workspace that combines project management, communication, and documentation',
    swot: {
      strengths: 'Integrated platform, Modern UI, Strong API',
      weaknesses: 'New to market, Limited brand recognition',
      opportunities: 'Remote work trend, Enterprise digital transformation',
      threats: 'Market saturation, Large competitors with deep pockets',
    },
  },
};

export const BusinessCaseTab: React.FC = () => {
  const { currentPortfolio, dispatch } = usePortfolio();
  const [businessCase, setBusinessCase] = useState<BusinessCase>(
    currentPortfolio?.businessCase || templates.blank
  );
  const [isEditing, setIsEditing] = useState(true);

  useEffect(() => {
    if (currentPortfolio) {
      setBusinessCase(currentPortfolio.businessCase);
      setIsEditing(
        !currentPortfolio.businessCase.problem &&
        !currentPortfolio.businessCase.valueProp
      );
    }
  }, [currentPortfolio]);

  const handleTemplateChange = (event: SelectChangeEvent) => {
    const template = event.target.value as keyof typeof templates;
    setBusinessCase(templates[template]);
    setIsEditing(true);
  };

  const handleChange = (field: string, value: string) => {
    if (field.startsWith('swot.')) {
      const swotField = field.split('.')[1];
      setBusinessCase({
        ...businessCase,
        swot: { ...businessCase.swot, [swotField]: value },
      });
    } else {
      setBusinessCase({ ...businessCase, [field]: value });
    }
  };

  const handleSave = () => {
    if (currentPortfolio) {
      dispatch({
        type: 'UPDATE_PORTFOLIO',
        payload: { ...currentPortfolio, businessCase },
      });
      setIsEditing(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Business Case
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Template</InputLabel>
        <Select defaultValue="blank" onChange={handleTemplateChange} label="Template">
          <MenuItem value="blank">Blank Template</MenuItem>
          <MenuItem value="startup">Basic Startup Template</MenuItem>
          <MenuItem value="saas">SaaS Product Template</MenuItem>
        </Select>
      </FormControl>

      {isEditing ? (
        <Box>
          <TextField
            fullWidth
            label="Problem Statement"
            multiline
            rows={3}
            value={businessCase.problem}
            onChange={(e) => handleChange('problem', e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Value Proposition"
            multiline
            rows={3}
            value={businessCase.valueProp}
            onChange={(e) => handleChange('valueProp', e.target.value)}
            sx={{ mb: 2 }}
          />

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            SWOT Analysis
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            <Box sx={{ flex: "1 1 calc(50% - 8px)", minWidth: "300px" }}>
              <TextField
                fullWidth
                label="Strengths"
                multiline
                rows={4}
                value={businessCase.swot.strengths}
                onChange={(e) => handleChange('swot.strengths', e.target.value)}
              />
            </Box>
            <Box sx={{ flex: "1 1 calc(50% - 8px)", minWidth: "300px" }}>
              <TextField
                fullWidth
                label="Weaknesses"
                multiline
                rows={4}
                value={businessCase.swot.weaknesses}
                onChange={(e) => handleChange('swot.weaknesses', e.target.value)}
              />
            </Box>
            <Box sx={{ flex: "1 1 calc(50% - 8px)", minWidth: "300px" }}>
              <TextField
                fullWidth
                label="Opportunities"
                multiline
                rows={4}
                value={businessCase.swot.opportunities}
                onChange={(e) => handleChange('swot.opportunities', e.target.value)}
              />
            </Box>
            <Box sx={{ flex: "1 1 calc(50% - 8px)", minWidth: "300px" }}>
              <TextField
                fullWidth
                label="Threats"
                multiline
                rows={4}
                value={businessCase.swot.threats}
                onChange={(e) => handleChange('swot.threats', e.target.value)}
              />
            </Box>
          </Box>

          <Button variant="contained" onClick={handleSave} sx={{ mt: 3 }}>
            Save Business Case
          </Button>
        </Box>
      ) : (
        <Box>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Business Case Summary</Typography>
                <Button startIcon={<Edit />} onClick={handleEdit}>
                  Edit
                </Button>
              </Box>

              <Typography variant="subtitle1" color="primary" gutterBottom>
                Problem Statement
              </Typography>
              <Typography paragraph>{businessCase.problem}</Typography>

              <Typography variant="subtitle1" color="primary" gutterBottom>
                Value Proposition
              </Typography>
              <Typography paragraph>{businessCase.valueProp}</Typography>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                SWOT Analysis
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                <Box sx={{ flex: "1 1 calc(50% - 8px)", minWidth: "300px" }}>
                  <Typography variant="subtitle2" color="success.main">
                    Strengths
                  </Typography>
                  <Typography>{businessCase.swot.strengths}</Typography>
                </Box>
                <Box sx={{ flex: "1 1 calc(50% - 8px)", minWidth: "300px" }}>
                  <Typography variant="subtitle2" color="error.main">
                    Weaknesses
                  </Typography>
                  <Typography>{businessCase.swot.weaknesses}</Typography>
                </Box>
                <Box sx={{ flex: "1 1 calc(50% - 8px)", minWidth: "300px" }}>
                  <Typography variant="subtitle2" color="info.main">
                    Opportunities
                  </Typography>
                  <Typography>{businessCase.swot.opportunities}</Typography>
                </Box>
                <Box sx={{ flex: "1 1 calc(50% - 8px)", minWidth: "300px" }}>
                  <Typography variant="subtitle2" color="warning.main">
                    Threats
                  </Typography>
                  <Typography>{businessCase.swot.threats}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};
