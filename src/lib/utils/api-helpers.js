export function buildQueryParams(params = {}) {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });
  
  return queryParams;
}

export function handleApiError(error, defaultMessage = 'API Error') {
  if (error.response) {
    return `HTTP ${error.response.status}: ${error.response.statusText}`;
  }
  return error.message || defaultMessage;
}

export function formatWordPressData(data) {
  if (!data) return null;
  
  return {
    id: data.id,
    title: data.title?.rendered || '',
    content: data.content?.rendered || '',
    excerpt: data.excerpt?.rendered || '',
    slug: data.slug,
    date: data.date,
    modified: data.modified,
    acf: data.acf || {},
    featured_media: data.featured_media,
    _embedded: data._embedded
  };
} 