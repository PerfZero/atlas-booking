export async function GET() {
  try {
    const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://test.devdenis.ru/wp-json/wp/v2';
    
    const response = await fetch(`${WORDPRESS_API_URL}/`);
    
    if (!response.ok) {
      return Response.json({
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        url: WORDPRESS_API_URL
      }, { status: 500 });
    }
    
    const data = await response.json();
    
    return Response.json({
      success: true,
      data: data,
      url: WORDPRESS_API_URL
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
      url: process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://test.devdenis.ru/wp-json/wp/v2'
    }, { status: 500 });
  }
} 