import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
} from '@mui/material';
import { Add, Delete, DragIndicator } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { usePortfolio } from '../context/PortfolioContext';
import { Milestone } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const RoadmapTab: React.FC = () => {
  const { currentPortfolio, dispatch } = usePortfolio();
  const [openDialog, setOpenDialog] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDate, setMilestoneDate] = useState('');
  const [milestoneDependencies, setMilestoneDependencies] = useState('');

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setMilestoneTitle('');
    setMilestoneDate('');
    setMilestoneDependencies('');
  };

  const handleAddMilestone = () => {
    if (!currentPortfolio || !milestoneTitle.trim()) return;

    const newMilestone: Milestone = {
      id: uuidv4(),
      title: milestoneTitle,
      date: milestoneDate,
      dependencies: milestoneDependencies.split(',').map((d) => d.trim()).filter((d) => d),
    };

    dispatch({
      type: 'UPDATE_PORTFOLIO',
      payload: {
        ...currentPortfolio,
        roadmap: {
          milestones: [...currentPortfolio.roadmap.milestones, newMilestone],
        },
      },
    });

    handleCloseDialog();
  };

  const handleDeleteMilestone = (id: string) => {
    if (!currentPortfolio) return;

    dispatch({
      type: 'UPDATE_PORTFOLIO',
      payload: {
        ...currentPortfolio,
        roadmap: {
          milestones: currentPortfolio.roadmap.milestones.filter((m) => m.id !== id),
        },
      },
    });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !currentPortfolio) return;

    const items = Array.from(currentPortfolio.roadmap.milestones);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    dispatch({
      type: 'UPDATE_PORTFOLIO',
      payload: {
        ...currentPortfolio,
        roadmap: {
          milestones: items,
        },
      },
    });
  };

  const getMonthsDiff = (date1: string, date2: string): number => {
    if (!date1 || !date2) return 0;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
  };

  const getGanttBarWidth = (date: string): number => {
    if (!date || !currentPortfolio?.roadmap.milestones.length) return 100;
    const firstDate = currentPortfolio.roadmap.milestones[0]?.date;
    if (!firstDate) return 100;
    const months = getMonthsDiff(firstDate, date);
    return Math.max(100, months * 50 + 100);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Product Roadmap</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenDialog}>
          Add Milestone
        </Button>
      </Box>

      <Typography variant="h6" gutterBottom>
        Timeline (Drag to Reorder)
      </Typography>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="milestones">
          {(provided) => (
            <Box {...provided.droppableProps} ref={provided.innerRef}>
              {currentPortfolio.roadmap.milestones.length === 0 ? (
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography color="text.secondary">
                      No milestones yet. Click "Add Milestone" to get started.
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                currentPortfolio.roadmap.milestones.map((milestone, index) => (
                  <Draggable key={milestone.id} draggableId={milestone.id} index={index}>
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        sx={{
                          mb: 2,
                          backgroundColor: snapshot.isDragging ? '#f0f0f0' : 'white',
                          boxShadow: snapshot.isDragging ? 6 : 1,
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box {...provided.dragHandleProps}>
                              <DragIndicator sx={{ cursor: 'grab' }} />
                            </Box>

                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="h6">{milestone.title}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                Date: {milestone.date || 'Not set'}
                              </Typography>
                              {milestone.dependencies.length > 0 && (
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Dependencies:
                                  </Typography>
                                  {milestone.dependencies.map((dep, idx) => (
                                    <Chip key={idx} label={dep} size="small" sx={{ ml: 1 }} />
                                  ))}
                                </Box>
                              )}
                            </Box>

                            <IconButton onClick={() => handleDeleteMilestone(milestone.id)}>
                              <Delete />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>

      {currentPortfolio.roadmap.milestones.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Gantt-like Timeline View
          </Typography>
          <Box sx={{ overflowX: 'auto' }}>
            {currentPortfolio.roadmap.milestones.map((milestone) => (
              <Box key={milestone.id} sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  {milestone.title}
                </Typography>
                <Box
                  sx={{
                    width: `${getGanttBarWidth(milestone.date)}px`,
                    height: 30,
                    backgroundColor: '#1976d2',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    px: 2,
                    color: 'white',
                    fontSize: '0.875rem',
                  }}
                >
                  {milestone.date || 'No date'}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Milestone</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Milestone Title"
            fullWidth
            value={milestoneTitle}
            onChange={(e) => setMilestoneTitle(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Date"
            type="date"
            fullWidth
            value={milestoneDate}
            onChange={(e) => setMilestoneDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Dependencies (comma-separated)"
            fullWidth
            value={milestoneDependencies}
            onChange={(e) => setMilestoneDependencies(e.target.value)}
            helperText="e.g., MVP Launch, User Testing"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleAddMilestone} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
