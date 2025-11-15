const WORDPRESS_URL = 'https://api.booking.atlas.kz';
const API_BASE = `${WORDPRESS_URL}/wp-json/atlas-hajj/v1`;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const departureCity = searchParams.get('departureCity');
    const pilgrimageType = searchParams.get('pilgrimageType');
    
    let queryParams = '';
    if (departureCity && departureCity !== 'all') {
      queryParams += `?departure_city=${departureCity}`;
    }
    if (pilgrimageType && pilgrimageType !== 'all') {
      queryParams += queryParams ? `&pilgrimage_type=${pilgrimageType}` : `?pilgrimage_type=${pilgrimageType}`;
    }
    
    const response = await fetch(`${API_BASE}/tour-dates${queryParams}`);
    if (!response.ok) {
      throw new Error('Ошибка загрузки дат туров');
    }
    
    const dates = await response.json();
    
    return Response.json(dates);
  } catch (error) {
    console.error('Ошибка получения дат туров:', error);
    return Response.json(
      { error: 'Failed to fetch tour dates', details: error.message },
      { status: 500 }
    );
  }
}

