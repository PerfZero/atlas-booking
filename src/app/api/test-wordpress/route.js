import { testWordPressConnection } from '../../../lib/api';

export async function GET() {
  try {
    const result = await testWordPressConnection();
    
    if (result.success) {
      return Response.json({
        success: true,
        message: 'WordPress API доступен',
        data: result.data
      });
    } else {
      return Response.json({
        success: false,
        message: 'Ошибка подключения к WordPress API',
        error: result.error
      }, { status: 500 });
    }
  } catch (error) {
    return Response.json({
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: error.message
    }, { status: 500 });
  }
} 