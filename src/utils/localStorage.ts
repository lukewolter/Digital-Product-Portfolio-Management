import { Portfolio } from '../types';

const STORAGE_KEY = 'portfolios';

export const loadPortfolios = (): Portfolio[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading portfolios:', error);
    return [];
  }
};

export const savePortfolios = (portfolios: Portfolio[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolios));
  } catch (error) {
    console.error('Error saving portfolios:', error);
  }
};

export const clearPortfolios = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing portfolios:', error);
  }
};
