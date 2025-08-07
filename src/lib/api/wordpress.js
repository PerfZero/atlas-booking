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