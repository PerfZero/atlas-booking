// Базовые константы API
export const API_BASE = '/api';

export const API_ENDPOINTS = {
  TOURS: `${API_BASE}/tours`,
  REVIEWS: `${API_BASE}/reviews`,
  PARTNERS: `${API_BASE}/partners`,
  FAQ: `${API_BASE}/faq`
};

export const DEFAULT_PARAMS = {
  PER_PAGE: 12,
  EMBED: '_embed=1'
};

export const ERROR_MESSAGES = {
  FETCH_FAILED: 'Failed to fetch data',
  NOT_FOUND: 'Data not found',
  NETWORK_ERROR: 'Network error occurred',
  SERVER_ERROR: 'Server error occurred'
}; 