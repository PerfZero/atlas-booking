const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://test.devdenis.ru/wp-json/wp/v2';

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