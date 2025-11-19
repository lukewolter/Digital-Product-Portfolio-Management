import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Select,
  MenuItem,
  Button,
  TextField,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import { usePortfolio, createEmptyPortfolio } from '../context/PortfolioContext';

export const Header: React.FC = () => {
  const { state, dispatch, currentPortfolio } = usePortfolio();
  const [openDialog, setOpenDialog] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [newPortfolioDescription, setNewPortfolioDescription] = useState('');
  const [error, setError] = useState('');

  const handlePortfolioChange = (event: SelectChangeEvent) => {
    dispatch({ type: 'SET_CURRENT_PORTFOLIO', payload: event.target.value });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: event.target.value });
  };

  const handleOpenDialog = () => {
    if (state.portfolios.length >= 3) {
      setError('Maximum 3 portfolios allowed for MVP');
      return;
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewPortfolioName('');
    setNewPortfolioDescription('');
    setError('');
  };

  const handleCreatePortfolio = () => {
    if (!newPortfolioName.trim()) {
      setError('Portfolio name is required');
      return;
    }

    const newPortfolio = createEmptyPortfolio(newPortfolioName, newPortfolioDescription);
    dispatch({ type: 'ADD_PORTFOLIO', payload: newPortfolio });
    handleCloseDialog();
  };

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 3 }}>
            Product Portfolio Manager Demo
          </Typography>

          {state.portfolios.length > 0 && (
            <FormControl sx={{ minWidth: 250, mr: 2 }} size="small">
              <InputLabel sx={{ color: 'white' }}>Portfolio</InputLabel>
              <Select
                value={currentPortfolio?.id || ''}
                onChange={handlePortfolioChange}
                label="Portfolio"
                sx={{
                  color: 'white',
                  '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                  '.MuiSvgIcon-root': { color: 'white' },
                }}
              >
                {state.portfolios.map((portfolio) => (
                  <MenuItem key={portfolio.id} value={portfolio.id}>
                    {portfolio.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenDialog}
            sx={{
              mr: 2,
              backgroundColor: 'white',
              color: '#1976d2',
              '&:hover': { backgroundColor: '#f0f0f0' },
            }}
            disabled={state.portfolios.length >= 3}
          >
            Add Portfolio
          </Button>

          <Box sx={{ flexGrow: 1 }} />

          <TextField
            placeholder="Search..."
            value={state.searchQuery}
            onChange={handleSearchChange}
            size="small"
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'white' }} />,
            }}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: 1,
              input: { color: 'white' },
              '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
            }}
          />
        </Toolbar>
      </AppBar>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Portfolio</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Portfolio Name"
            fullWidth
            value={newPortfolioName}
            onChange={(e) => setNewPortfolioName(e.target.value)}
            error={!!error && !newPortfolioName.trim()}
            helperText={error && !newPortfolioName.trim() ? error : ''}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={newPortfolioDescription}
            onChange={(e) => setNewPortfolioDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleCreatePortfolio} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
