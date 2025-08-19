import { createKaspiPayment } from '../../../../lib/wordpress-api';

export async function POST(request) {
  try {
    const body = await request.json();
    
    const result = await createKaspiPayment(body);

    if (!result.success) {
      return Response.json(
        { error: result.error || 'Ошибка создания платежа' },
        { status: 400 }
      );
    }

    return Response.json(result);
  } catch (error) {
    console.error('Ошибка создания платежа:', error);
    return Response.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

