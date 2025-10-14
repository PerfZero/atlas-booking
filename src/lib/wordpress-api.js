const WORDPRESS_URL = 'https://api.booking.atlas.kz';
const API_BASE = `${WORDPRESS_URL}/wp-json/atlas-hajj/v1`;

export async function getTours(queryParams = '') {
  try {
    const response = await fetch(`${API_BASE}/tours${queryParams}`);
    if (!response.ok) throw new Error('Ошибка загрузки туров');
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка получения туров:', error);
    return [];
  }
}

export async function searchToursWithFilters(filters = {}) {
  try {
    const params = new URLSearchParams();
    
    if (filters.departureCity) params.append('departure_city', filters.departureCity);
    if (filters.pilgrimageType) params.append('pilgrimage_type', filters.pilgrimageType);
    if (filters.startDate) params.append('start_date', filters.startDate);
    if (filters.endDate) params.append('end_date', filters.endDate);
    if (filters.minPrice) params.append('min_price', filters.minPrice);
    if (filters.maxPrice) params.append('max_price', filters.maxPrice);
    if (filters.sortBy) params.append('sort_by', filters.sortBy);
    
    const response = await fetch(`${API_BASE}/search-tours?${params.toString()}`);
    if (!response.ok) throw new Error('Ошибка поиска туров');
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка поиска туров:', error);
    return [];
  }
}

export async function getTourBySlug(slug) {
  try {
    const response = await fetch(`${API_BASE}/tour/${slug}`);
    if (!response.ok) throw new Error('Ошибка загрузки тура');
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка получения тура:', error);
    return null;
  }
}

export async function getReviews() {
  try {
    const response = await fetch(`${API_BASE}/reviews`);
    if (!response.ok) throw new Error('Ошибка загрузки отзывов');
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка получения отзывов:', error);
    return [];
  }
}

export async function getPartners() {
  try {
    const response = await fetch(`${API_BASE}/partners`);
    if (!response.ok) throw new Error('Ошибка загрузки партнеров');
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка получения партнеров:', error);
    return [];
  }
}

export async function getFAQ() {
  try {
    const response = await fetch(`${API_BASE}/faq`);
    if (!response.ok) throw new Error('Ошибка загрузки FAQ');
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка получения FAQ:', error);
    return [];
  }
}

export async function getHomeSettings() {
  try {
    const response = await fetch(`${WORDPRESS_URL}/wp-json/acf/v3/posts/1`);
    if (!response.ok) throw new Error('Ошибка загрузки настроек главной страницы');
    
    const data = await response.json();
    return data.acf || {};
  } catch (error) {
    console.error('Ошибка получения настроек главной страницы:', error);
    return {};
  }
}

export async function getHomePageSettings() {
  try {
    const response = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/pages/1`);
    if (!response.ok) throw new Error('Ошибка загрузки настроек главной страницы');
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка получения настроек главной страницы:', error);
    return null;
  }
}

export async function searchTours(searchQuery) {
  try {
    const response = await fetch(`${API_BASE}/posts?categories=1&search=${encodeURIComponent(searchQuery)}&_embed`);
    if (!response.ok) throw new Error('Ошибка поиска туров');
    
    const posts = await response.json();
    return posts.map(post => ({
      id: post.id,
      slug: post.slug,
      title: post.title.rendered,
      excerpt: post.excerpt.rendered,
      featured_media: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/tour_1.png',
      date: post.date,
      acf: post.acf || {}
    }));
  } catch (error) {
    console.error('Ошибка поиска туров:', error);
    return [];
  }
}

export async function sendSMS(phone, code) {
  try {
    const response = await fetch(`${API_BASE}/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: phone,
        code: code
      })
    });
    
    if (!response.ok) throw new Error('Ошибка отправки SMS');
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка отправки SMS:', error);
    return { success: false, error: error.message };
  }
}

export async function verifyCode(phone, code) {
  try {
    const response = await fetch(`${API_BASE}/verify-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: phone,
        code: code
      })
    });
    
    if (!response.ok) throw new Error('Ошибка проверки кода');
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка проверки кода:', error);
    return { success: false, error: error.message };
  }
}

export async function checkAuth(token) {
  try {
    const response = await fetch(`${API_BASE}/check-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token
      })
    });
    
    if (!response.ok) throw new Error('Ошибка проверки авторизации');
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка проверки авторизации:', error);
    return { success: false, error: error.message };
  }
}

export async function logout(token) {
  try {
    const response = await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token
      })
    });
    
    if (!response.ok) throw new Error('Ошибка выхода');
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка выхода:', error);
    return { success: false, error: error.message };
  }
}

export async function getProfile(token) {
  try {
    const response = await fetch(`${API_BASE}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) throw new Error('Ошибка получения профиля');
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    return { success: false, error: error.message };
  }
}

export async function updateProfile(token, profileData) {
  try {
    const response = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData)
    });
    
    if (!response.ok) throw new Error('Ошибка обновления профиля');
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    return { success: false, error: error.message };
  }
}

export async function getCategories() {
  try {
    const response = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/categories`);
    if (!response.ok) throw new Error('Ошибка загрузки категорий');
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка получения категорий:', error);
    return [];
  }
}

export async function bookTour(token, tourId, tourData) {
  try {
    const response = await fetch(`${API_BASE}/book-tour`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        token: token, 
        tour_id: tourId, 
        tour_data: tourData 
      })
    });
    if (!response.ok) throw new Error('Ошибка бронирования тура');
    return await response.json();
  } catch (error) {
    console.error('Ошибка бронирования тура:', error);
    return { success: false, error: error.message };
  }
}

export async function getMyBookings(token) {
  try {
    const response = await fetch(`${API_BASE}/my-bookings?token=${token}`);
    if (!response.ok) throw new Error('Ошибка загрузки бронирований');
    return await response.json();
  } catch (error) {
    console.error('Ошибка получения бронирований:', error);
    return { success: false, error: error.message };
  }
}

export async function createKaspiPayment(paymentData) {
  try {
    const response = await fetch(`${API_BASE}/kaspi-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData)
    });
    
    if (!response.ok) throw new Error('Ошибка создания платежа Kaspi');
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка создания платежа Kaspi:', error);
    return { success: false, error: error.message };
  }
}
