const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://test.devdenis.ru/wp-json/wp/v2';

export async function getReviews() {
  const response = await fetch(`${WORDPRESS_API_URL}/reviews?_embed=1&per_page=6`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch reviews');
  }
  
  return response.json();
}

export async function getPartners() {
  const response = await fetch(`${WORDPRESS_API_URL}/partners?_embed=1`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch partners');
  }
  
  return response.json();
}

export async function getFAQ() {
  const response = await fetch(`${WORDPRESS_API_URL}/faq?_embed=1`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch FAQ');
  }
  
  return response.json();
} 