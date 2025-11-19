import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { RocketLaunch } from '@mui/icons-material';

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RocketLaunch color="primary" />
          <Typography variant="h5">Welcome to Product Portfolio Manager!</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography paragraph>
          This demo application helps you manage digital product portfolios with comprehensive tools for:
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <li>
            <Typography>Business case development with SWOT analysis</Typography>
          </li>
          <li>
            <Typography>Market research and competitive analysis</Typography>
          </li>
          <li>
            <Typography>Product roadmap planning with drag-and-drop timelines</Typography>
          </li>
          <li>
            <Typography>Investment planning with ROI and NPV calculators</Typography>
          </li>
          <li>
            <Typography>Product lifecycle tracking and KPI monitoring</Typography>
          </li>
        </Box>
        <Typography paragraph sx={{ mt: 2 }}>
          Get started by creating your first portfolio!
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" size="large">
          Get Started
        </Button>
      </DialogActions>
    </Dialog>
  );
};
