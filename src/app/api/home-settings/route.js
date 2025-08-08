import { getHomePageSettings } from '../../../lib/wordpress-api';

export async function GET() {
  try {
    const homePage = await getHomePageSettings();
    
    if (!homePage) {
      return Response.json(
        { error: 'Home page not found' },
        { status: 404 }
      );
    }
    
    return Response.json({
      acf: homePage.acf || {},
      title: homePage.title?.rendered,
      content: homePage.content?.rendered,
      success: true
    });
  } catch (error) {
    return Response.json(
      { 
        error: 'Failed to fetch home settings',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 