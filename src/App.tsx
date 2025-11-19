import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, Tabs, Tab, Snackbar, Alert } from '@mui/material';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { Header } from './components/Header';
import { BusinessCaseTab } from './components/BusinessCaseTab';
import { MarketResearchTab } from './components/MarketResearchTab';
import { RoadmapTab } from './components/RoadmapTab';
import { InvestmentPlanningTab } from './components/InvestmentPlanningTab';
import { ProductLifecycleTab } from './components/ProductLifecycleTab';
import { Footer } from './components/Footer';
import { WelcomeModal } from './components/WelcomeModal';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

const AppContent: React.FC = () => {
  const { state } = usePortfolio();
  const [tabValue, setTabValue] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    if (state.portfolios.length === 0) {
      setShowWelcome(true);
    }
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleShowNotification = (message: string, severity: 'success' | 'error' | 'info') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <WelcomeModal open={showWelcome} onClose={() => setShowWelcome(false)} />

      {state.portfolios.length > 0 && (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: 'white' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ px: 2 }}
            >
              <Tab label="Business Case" />
              <Tab label="Market Research" />
              <Tab label="Roadmap" />
              <Tab label="Investment Planning" />
              <Tab label="Product Lifecycle" />
            </Tabs>
          </Box>

          <Box sx={{ flexGrow: 1, backgroundColor: '#fafafa' }}>
            <TabPanel value={tabValue} index={0}>
              <BusinessCaseTab />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <MarketResearchTab />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <RoadmapTab />
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
              <InvestmentPlanningTab />
            </TabPanel>
            <TabPanel value={tabValue} index={4}>
              <ProductLifecycleTab />
            </TabPanel>
          </Box>
        </>
      )}

      {state.portfolios.length === 0 && !showWelcome && (
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <h2>No Portfolios Yet</h2>
            <p>Click "Add Portfolio" in the header to create your first portfolio</p>
          </Box>
        </Box>
      )}

      <Footer onShowNotification={handleShowNotification} />

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PortfolioProvider>
        <AppContent />
      </PortfolioProvider>
    </ThemeProvider>
  );
};

export default App;
