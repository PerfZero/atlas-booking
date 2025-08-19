export async function POST(request) {
  try {
    const body = await request.json();
    
    const response = await fetch('https://booking.devdenis.ru/wp-json/atlas-hajj/v1/kaspi/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        { error: data.message || 'Ошибка создания платежа' },
        { status: response.status }
      );
    }

    return Response.json(data);
  } catch (error) {
    console.error('Ошибка создания платежа:', error);
    return Response.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

