export const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://test.devdenis.ru/wp-json/wp/v2';

export const API_ENDPOINTS = {
  WORDPRESS_BASE: WORDPRESS_API_URL,
  PAGES: `${WORDPRESS_API_URL}/pages`,
  TOURS: `${WORDPRESS_API_URL}/tours`,
  REVIEWS: `${WORDPRESS_API_URL}/reviews`,
  PARTNERS: `${WORDPRESS_API_URL}/partners`,
  FAQ: `${WORDPRESS_API_URL}/faq`
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