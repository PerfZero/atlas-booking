// Статичные данные для туров
export const toursData = [
  {
    id: 1,
    slug: 'umra-2024',
    title: 'Умра 2024',
    excerpt: 'Духовное путешествие в Мекку и Медину',
    featured_media: '/tour_1.png',
    acf: {
      price: '250000',
      duration: '15 дней',
      departure_date: '2024-03-15',
      return_date: '2024-03-30'
    }
  },
  {
    id: 2,
    slug: 'hajj-2024',
    title: 'Хадж 2024',
    excerpt: 'Паломничество в священные места ислама',
    featured_media: '/tour_2.png',
    acf: {
      price: '450000',
      duration: '25 дней',
      departure_date: '2024-07-01',
      return_date: '2024-07-25'
    }
  },
  {
    id: 3,
    slug: 'umra-ramadan',
    title: 'Умра в Рамадан',
    excerpt: 'Особое благословение в священный месяц',
    featured_media: '/tour_3.png',
    acf: {
      price: '300000',
      duration: '20 дней',
      departure_date: '2024-04-01',
      return_date: '2024-04-20'
    }
  },
  {
    id: 4,
    slug: 'umra-family',
    title: 'Семейная Умра',
    excerpt: 'Путешествие для всей семьи',
    featured_media: '/tour_4.png',
    acf: {
      price: '180000',
      duration: '12 дней',
      departure_date: '2024-05-15',
      return_date: '2024-05-27'
    }
  }
];

// Статичные данные для отзывов
export const reviewsData = [
  {
    id: 1,
    title: 'Отличная организация',
    content: 'Все было организовано на высшем уровне. Рекомендую всем!',
    acf: {
      author_name: 'Ахмед Ибрагимов',
      author_photo: '/man_1.png',
      rating: 5
    }
  },
  {
    id: 2,
    title: 'Незабываемое путешествие',
    content: 'Благодарю Atlas Tourism за прекрасную поездку в Умру.',
    acf: {
      author_name: 'Фатима Алиева',
      author_photo: '/woman_1.png',
      rating: 5
    }
  },
  {
    id: 3,
    title: 'Профессиональный подход',
    content: 'Все детали были продуманы, никаких проблем не возникло.',
    acf: {
      author_name: 'Мухаммад Садыков',
      author_photo: '/man_2.png',
      rating: 5
    }
  },
  {
    id: 4,
    title: 'Духовное обновление',
    content: 'Поездка помогла мне духовно обновиться. Спасибо!',
    acf: {
      author_name: 'Айша Нурланова',
      author_photo: '/woman_2.png',
      rating: 5
    }
  },
  {
    id: 5,
    title: 'Отличные гиды',
    content: 'Гиды были очень знающими и внимательными.',
    acf: {
      author_name: 'Ибрагим Каримов',
      author_photo: '/man_3.png',
      rating: 5
    }
  },
  {
    id: 6,
    title: 'Комфортное проживание',
    content: 'Отели были отличными, питание разнообразным.',
    acf: {
      author_name: 'Зухра Абдуллаева',
      author_photo: '/woman_3.png',
      rating: 5
    }
  }
];

// Статичные данные для партнеров
export const partnersData = [
  {
    id: 1,
    title: 'Air Astana',
    featured_media: '/air_astana.svg'
  },
  {
    id: 2,
    title: 'Fairmont',
    featured_media: '/fairmont.svg'
  }
];

// Статичные данные для FAQ
export const faqData = [
  {
    id: 1,
    title: 'Что такое Умра?',
    content: 'Умра - это малое паломничество в Мекку, которое можно совершать в любое время года.'
  },
  {
    id: 2,
    title: 'Какие документы нужны?',
    content: 'Для поездки нужен загранпаспорт, виза и медицинская страховка.'
  },
  {
    id: 3,
    title: 'Сколько длится поездка?',
    content: 'Длительность поездки зависит от выбранного тура, обычно от 12 до 25 дней.'
  },
  {
    id: 4,
    title: 'Включено ли питание?',
    content: 'Да, в стоимость тура включено трехразовое питание в отелях.'
  },
  {
    id: 5,
    title: 'Нужна ли прививка?',
    content: 'Да, обязательна прививка от менингококковой инфекции.'
  },
  {
    id: 6,
    title: 'Можно ли взять детей?',
    content: 'Да, мы организуем семейные туры с учетом потребностей детей.'
  }
];

// Функции для получения данных
export async function getTours(queryParams = '') {
  // Имитация задержки API
  await new Promise(resolve => setTimeout(resolve, 100));
  return toursData;
}

export async function getTourBySlug(slug) {
  await new Promise(resolve => setTimeout(resolve, 100));
  return toursData.find(tour => tour.slug === slug) || null;
}

export async function getReviews() {
  await new Promise(resolve => setTimeout(resolve, 100));
  return reviewsData;
}

export async function getPartners() {
  await new Promise(resolve => setTimeout(resolve, 100));
  return partnersData;
}

export async function getFAQ() {
  await new Promise(resolve => setTimeout(resolve, 100));
  return faqData;
} 