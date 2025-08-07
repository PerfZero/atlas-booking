const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://test.devdenis.ru/wp-json/wp/v2';

export async function testWordPressConnection() {
  try {
    const response = await fetch(`${WORDPRESS_API_URL}/`);
    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    } else {
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getHomePageSettings() {
  try {
    const response = await fetch(`${WORDPRESS_API_URL}/pages?slug=home&_embed=1`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const pages = await response.json();
    
    if (!pages || pages.length === 0) {
      const allPagesResponse = await fetch(`${WORDPRESS_API_URL}/pages?_embed=1&per_page=1`);
      const allPages = await allPagesResponse.json();
      return allPages[0] || null;
    }
    
    return pages[0];
  } catch (error) {
    throw error;
  }
}

export async function getTours(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.departureCity) {
    queryParams.append('meta_query[0][key]', 'departure_city');
    queryParams.append('meta_query[0][value]', params.departureCity);
  }
  
  if (params.pilgrimageType) {
    queryParams.append('meta_query[1][key]', 'pilgrimage_type');
    queryParams.append('meta_query[1][value]', params.pilgrimageType);
  }
  
  if (params.priceMin) {
    queryParams.append('meta_query[2][key]', 'price');
    queryParams.append('meta_query[2][value]', params.priceMin);
    queryParams.append('meta_query[2][compare]', '>=');
  }
  
  if (params.priceMax) {
    queryParams.append('meta_query[3][key]', 'price');
    queryParams.append('meta_query[3][value]', params.priceMax);
    queryParams.append('meta_query[3][compare]', '<=');
  }
  
  queryParams.append('per_page', params.per_page || 12);
  queryParams.append('_embed', '1');
  
  const response = await fetch(`${WORDPRESS_API_URL}/tours?${queryParams}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch tours');
  }
  
  return response.json();
}

export async function getTour(slug) {
  const response = await fetch(`${WORDPRESS_API_URL}/tours?slug=${slug}&_embed=1`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch tour');
  }
  
  const tours = await response.json();
  return tours[0];
}

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