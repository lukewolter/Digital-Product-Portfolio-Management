import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { Save, Download, RestartAlt } from '@mui/icons-material';
import { usePortfolio } from '../context/PortfolioContext';
import { savePortfolios, clearPortfolios } from '../utils/localStorage';
import { calculateHealthScore } from '../utils/calculations';

interface FooterProps {
  onShowNotification: (message: string, severity: 'success' | 'error' | 'info') => void;
}

export const Footer: React.FC<FooterProps> = ({ onShowNotification }) => {
  const { state, dispatch, currentPortfolio } = usePortfolio();

  const handleSaveAll = () => {
    savePortfolios(state.portfolios);
    onShowNotification('All portfolios saved successfully!', 'success');
  };

  const handleExportSummary = () => {
    if (state.portfolios.length === 0) {
      onShowNotification('No portfolios to export', 'error');
      return;
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      portfolios: state.portfolios,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio-summary-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onShowNotification('Portfolio summary exported successfully!', 'success');
  };

  const handleResetDemo = () => {
    if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      clearPortfolios();
      dispatch({ type: 'RESET_ALL' });
      onShowNotification('Demo reset successfully!', 'info');
      window.location.reload();
    }
  };

  const healthScore = currentPortfolio
    ? calculateHealthScore(
        !!currentPortfolio.businessCase.problem,
        currentPortfolio.marketResearch.competitors.length,
        currentPortfolio.marketResearch.personas.length,
        currentPortfolio.roadmap.milestones.length,
        currentPortfolio.investment.budget > 0,
        currentPortfolio.lifecycle.kpis.length
      )
    : 0;

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
        p: 2,
        backgroundColor: '#f5f5f5',
        borderTop: '1px solid #ddd',
        zIndex: 1000,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" startIcon={<Save />} onClick={handleSaveAll}>
            Save All
          </Button>
          <Button variant="outlined" startIcon={<Download />} onClick={handleExportSummary}>
            Export Summary
          </Button>
          <Button variant="outlined" color="error" startIcon={<RestartAlt />} onClick={handleResetDemo}>
            Reset Demo
          </Button>
        </Box>

        {currentPortfolio && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Portfolio Health Score:
            </Typography>
            <Box
              sx={{
                px: 2,
                py: 1,
                backgroundColor: healthScore >= 70 ? '#4caf50' : healthScore >= 40 ? '#ff9800' : '#f44336',
                color: 'white',
                borderRadius: 1,
                fontWeight: 'bold',
              }}
            >
              {healthScore}%
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
};
