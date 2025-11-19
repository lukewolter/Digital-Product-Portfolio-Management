import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Portfolio } from '../types';
import { loadPortfolios, savePortfolios } from '../utils/localStorage';
import { v4 as uuidv4 } from 'uuid';

interface PortfolioState {
  portfolios: Portfolio[];
  currentPortfolioId: string | null;
  searchQuery: string;
}

type PortfolioAction =
  | { type: 'SET_PORTFOLIOS'; payload: Portfolio[] }
  | { type: 'ADD_PORTFOLIO'; payload: Portfolio }
  | { type: 'UPDATE_PORTFOLIO'; payload: Portfolio }
  | { type: 'DELETE_PORTFOLIO'; payload: string }
  | { type: 'SET_CURRENT_PORTFOLIO'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'RESET_ALL' };

const initialState: PortfolioState = {
  portfolios: [],
  currentPortfolioId: null,
  searchQuery: '',
};

const portfolioReducer = (state: PortfolioState, action: PortfolioAction): PortfolioState => {
  switch (action.type) {
    case 'SET_PORTFOLIOS':
      return {
        ...state,
        portfolios: action.payload,
        currentPortfolioId: action.payload.length > 0 ? action.payload[0].id : null,
      };
    case 'ADD_PORTFOLIO':
      return {
        ...state,
        portfolios: [...state.portfolios, action.payload],
        currentPortfolioId: action.payload.id,
      };
    case 'UPDATE_PORTFOLIO':
      return {
        ...state,
        portfolios: state.portfolios.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case 'DELETE_PORTFOLIO':
      const filtered = state.portfolios.filter((p) => p.id !== action.payload);
      return {
        ...state,
        portfolios: filtered,
        currentPortfolioId: filtered.length > 0 ? filtered[0].id : null,
      };
    case 'SET_CURRENT_PORTFOLIO':
      return {
        ...state,
        currentPortfolioId: action.payload,
      };
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
      };
    case 'RESET_ALL':
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

interface PortfolioContextType {
  state: PortfolioState;
  dispatch: React.Dispatch<PortfolioAction>;
  currentPortfolio: Portfolio | null;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(portfolioReducer, initialState);

  useEffect(() => {
    const loaded = loadPortfolios();
    dispatch({ type: 'SET_PORTFOLIOS', payload: loaded });
  }, []);

  useEffect(() => {
    if (state.portfolios.length > 0) {
      savePortfolios(state.portfolios);
    }
  }, [state.portfolios]);

  const currentPortfolio = state.portfolios.find((p) => p.id === state.currentPortfolioId) || null;

  return (
    <PortfolioContext.Provider value={{ state, dispatch, currentPortfolio }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within PortfolioProvider');
  }
  return context;
};

export const createEmptyPortfolio = (name: string, description: string): Portfolio => {
  return {
    id: uuidv4(),
    name,
    description,
    businessCase: {
      problem: '',
      valueProp: '',
      swot: {
        strengths: '',
        weaknesses: '',
        opportunities: '',
        threats: '',
      },
    },
    marketResearch: {
      competitors: [],
      personas: [],
      chartData: {
        labels: [],
        datasets: [
          {
            label: 'Market Share (%)',
            data: [],
            backgroundColor: [],
          },
        ],
      },
    },
    roadmap: {
      milestones: [],
    },
    investment: {
      budget: 0,
      revenue: 0,
      roi: 0,
      npv: 0,
      funding: [],
      scenarios: {
        multiplier: 1,
      },
    },
    lifecycle: {
      currentStage: 'Ideation',
      kpis: [],
      reminders: [],
    },
    healthScore: 0,
  };
};
