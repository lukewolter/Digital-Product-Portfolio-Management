import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Slider,
} from '@mui/material';

import { Add, Delete } from '@mui/icons-material';
import { usePortfolio } from '../context/PortfolioContext';
import { calculateROI, calculateNPV } from '../utils/calculations';
import { FundingSource } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const InvestmentPlanningTab: React.FC = () => {
  const { currentPortfolio, dispatch } = usePortfolio();
  const [budget, setBudget] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [fundingSource, setFundingSource] = useState('');
  const [fundingAmount, setFundingAmount] = useState('');

  useEffect(() => {
    if (currentPortfolio) {
      setBudget(currentPortfolio.investment.budget);
      setRevenue(currentPortfolio.investment.revenue);
      setMultiplier(currentPortfolio.investment.scenarios.multiplier);
    }
  }, [currentPortfolio]);

  const handleBudgetChange = (value: number) => {
    setBudget(value);
    updateInvestment(value, revenue, multiplier);
  };

  const handleRevenueChange = (value: number) => {
    setRevenue(value);
    updateInvestment(budget, value, multiplier);
  };

  const handleMultiplierChange = (value: number) => {
    setMultiplier(value);
    updateInvestment(budget, revenue, value);
  };

  const updateInvestment = (budgetVal: number, revenueVal: number, multiplierVal: number) => {
    if (!currentPortfolio) return;

    const adjustedRevenue = revenueVal * multiplierVal;
    const roi = calculateROI(adjustedRevenue, budgetVal);
    const npv = calculateNPV(adjustedRevenue, budgetVal);

    dispatch({
      type: 'UPDATE_PORTFOLIO',
      payload: {
        ...currentPortfolio,
        investment: {
          ...currentPortfolio.investment,
          budget: budgetVal,
          revenue: revenueVal,
          roi,
          npv,
          scenarios: {
            multiplier: multiplierVal,
          },
        },
      },
    });
  };

  const handleAddFunding = () => {
    if (!currentPortfolio || !fundingSource.trim() || !fundingAmount) return;

    const newFunding: FundingSource = {
      id: uuidv4(),
      source: fundingSource,
      amount: parseFloat(fundingAmount),
    };

    dispatch({
      type: 'UPDATE_PORTFOLIO',
      payload: {
        ...currentPortfolio,
        investment: {
          ...currentPortfolio.investment,
          funding: [...currentPortfolio.investment.funding, newFunding],
        },
      },
    });

    setFundingSource('');
    setFundingAmount('');
  };

  const handleDeleteFunding = (id: string) => {
    if (!currentPortfolio) return;

    dispatch({
      type: 'UPDATE_PORTFOLIO',
      payload: {
        ...currentPortfolio,
        investment: {
          ...currentPortfolio.investment,
          funding: currentPortfolio.investment.funding.filter((f) => f.id !== id),
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

  const totalFunding = currentPortfolio.investment.funding.reduce((sum, f) => sum + f.amount, 0);
  const adjustedRevenue = revenue * multiplier;
  const roi = calculateROI(adjustedRevenue, budget);
  const npv = calculateNPV(adjustedRevenue, budget);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Investment Planning
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ flex: "1 1 calc(50% - 8px)", minWidth: "300px" }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Financial Calculators
              </Typography>

              <TextField
                fullWidth
                label="Budget ($)"
                type="number"
                value={budget}
                onChange={(e) => handleBudgetChange(parseFloat(e.target.value) || 0)}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Expected Revenue ($)"
                type="number"
                value={revenue}
                onChange={(e) => handleRevenueChange(parseFloat(e.target.value) || 0)}
                sx={{ mb: 3 }}
              />

              <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1, mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  ROI (Return on Investment)
                </Typography>
                <Typography variant="h4" color={roi >= 0 ? 'success.main' : 'error.main'}>
                  {roi.toFixed(2)}%
                </Typography>
              </Box>

              <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  NPV (Net Present Value)
                </Typography>
                <Typography variant="h4" color={npv >= 0 ? 'success.main' : 'error.main'}>
                  ${npv.toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: "1 1 calc(50% - 8px)", minWidth: "300px" }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Funding Sources
              </Typography>

              <TextField
                fullWidth
                label="Funding Source"
                value={fundingSource}
                onChange={(e) => setFundingSource(e.target.value)}
                sx={{ mb: 2 }}
                placeholder="e.g., VC Round A, Angel Investment"
              />

              <TextField
                fullWidth
                label="Amount ($)"
                type="number"
                value={fundingAmount}
                onChange={(e) => setFundingAmount(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Button variant="contained" startIcon={<Add />} onClick={handleAddFunding} fullWidth>
                Add Funding Source
              </Button>

              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Source</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentPortfolio.investment.funding.map((funding) => (
                      <TableRow key={funding.id}>
                        <TableCell>{funding.source}</TableCell>
                        <TableCell align="right">${funding.amount.toLocaleString()}</TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => handleDeleteFunding(funding.id)}>
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {currentPortfolio.investment.funding.length > 0 && (
                      <TableRow>
                        <TableCell>
                          <strong>Total</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>${totalFunding.toLocaleString()}</strong>
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: "1 1 100%" }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Scenario Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Adjust the revenue multiplier to see "what-if" scenarios
              </Typography>

              <Box sx={{ px: 2, mt: 3 }}>
                <Typography gutterBottom>
                  Revenue Multiplier: {multiplier.toFixed(2)}x
                </Typography>
                <Slider
                  value={multiplier}
                  onChange={(_, value) => handleMultiplierChange(value as number)}
                  min={0.5}
                  max={3}
                  step={0.1}
                  marks={[
                    { value: 0.5, label: '0.5x' },
                    { value: 1, label: '1x' },
                    { value: 2, label: '2x' },
                    { value: 3, label: '3x' },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
                <Box sx={{ flex: "1 1 calc(33.333% - 8px)", minWidth: "250px" }}>
                  <Box sx={{ p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                    <Typography variant="subtitle2">Base Revenue</Typography>
                    <Typography variant="h6">${revenue.toLocaleString()}</Typography>
                  </Box>
                </Box>
                <Box sx={{ flex: "1 1 calc(33.333% - 8px)", minWidth: "250px" }}>
                  <Box sx={{ p: 2, backgroundColor: '#e8f5e9', borderRadius: 1 }}>
                    <Typography variant="subtitle2">Adjusted Revenue</Typography>
                    <Typography variant="h6">${adjustedRevenue.toLocaleString()}</Typography>
                  </Box>
                </Box>
                <Box sx={{ flex: "1 1 calc(33.333% - 8px)", minWidth: "250px" }}>
                  <Box sx={{ p: 2, backgroundColor: '#fff3e0', borderRadius: 1 }}>
                    <Typography variant="subtitle2">Scenario ROI</Typography>
                    <Typography variant="h6" color={roi >= 0 ? 'success.main' : 'error.main'}>
                      {roi.toFixed(2)}%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};
