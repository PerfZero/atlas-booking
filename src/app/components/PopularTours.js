"use client";
import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getTours } from '../../lib/wordpress-api';
import styles from './PopularTours.module.css';

function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('/')) return true;
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return '/tour_1.png';
  if (url.startsWith('/')) return url;
  if (isValidImageUrl(url)) return url;
  return '/tour_1.png';
}

function PopularToursContent() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const loadTours = async () => {
      try {
        setLoading(true);
        const isMobile = window.innerWidth <= 768;
        const limit = isMobile ? 8 : 4;
        const toursData = await getTours(`?per_page=${limit}`);
        setTours(toursData);
      } catch (err) {
        console.error('Ошибка загрузки туров:', err);
        setError('Не удалось загрузить туры');
      } finally {
        setLoading(false);
      }
    };

    loadTours();
  }, []);

  const getFirstHotelImage = (tour) => {
    if (!tour) return null;
    const hotelImages = [];
    if (Array.isArray(tour.hotel_mekka_details?.gallery) && tour.hotel_mekka_details.gallery.length > 0) {
      hotelImages.push(...tour.hotel_mekka_details.gallery);
    }
    if (Array.isArray(tour.hotel_medina_details?.gallery) && tour.hotel_medina_details.gallery.length > 0) {
      hotelImages.push(...tour.hotel_medina_details.gallery);
    }
    if (hotelImages.length > 0) {
      const imageUrl = hotelImages[0].url || hotelImages[0];
      return isValidImageUrl(imageUrl) ? imageUrl : null;
    }
    return null;
  };

  const getTourUrl = (tourSlug, tour = null) => {
    // Функция для поиска ближайшей даты
    const getNearestDate = (tourData) => {
      if (!tourData?.tour_dates || !Array.isArray(tourData.tour_dates) || tourData.tour_dates.length === 0) {
        return null;
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Фильтруем только будущие даты и сортируем по дате начала
      const futureDates = tourData.tour_dates
        .filter(dateRange => {
          if (!dateRange.date_start) return false;
          const startDate = new Date(dateRange.date_start);
          return startDate >= today;
        })
        .sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
      
      return futureDates.length > 0 ? futureDates[0] : null;
    };
    
    const nearestDate = tour ? getNearestDate(tour) : null;
    
    if (searchParams && searchParams.toString()) {
      const params = new URLSearchParams(searchParams);
      
      // Если есть ближайшая дата, обновляем параметры
      if (nearestDate) {
        params.set('startDate', nearestDate.date_start);
        params.set('endDate', nearestDate.date_end);
        params.set('travelDate', 'custom');
      }
      
      return `/tour/${tourSlug}?${params.toString()}`;
    }
    
    // Если нет searchParams, но есть ближайшая дата, создаем параметры
    if (nearestDate) {
      const params = new URLSearchParams({
        startDate: nearestDate.date_start,
        endDate: nearestDate.date_end,
        travelDate: 'custom',
        from: 'popular' // Помечаем, что пришли с популярных
      });
      return `/tour/${tourSlug}?${params.toString()}`;
    }
    
    return `/tour/${tourSlug}`;
  };

  if (loading) {
    return (
      <section className={styles.popularTours}>
        <div className={styles.container}>
          <h2 className={styles.title}>Популярные туры</h2>
          <div className={styles.cards}>
            <div className={styles.loading}>Загрузка туров...</div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.popularTours}>
        <div className={styles.container}>
          <h2 className={styles.title}>Популярные туры</h2>
          <div className={styles.cards}>
            <div className={styles.error}>{error}</div>
          </div>
        </div>
      </section>
    );
  }

  if (!tours || tours.length === 0) {
    return (
      <section className={styles.popularTours}>
        <div className={styles.container}>
          <h2 className={styles.title}>Популярные туры</h2>
          <div className={styles.cards}>
            <div className={styles.error}>Туры не найдены. Убедитесь, что в WordPress созданы посты с полем &quot;price&quot;.</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.popularTours}>
      <div className={styles.container}>
        <h2 className={styles.title}>Популярные туры</h2>
        
        <div className={styles.cards}>
          {tours.map((tour) => (
            <div key={tour.id} className={styles.card}>
              <Link href={getTourUrl(tour.slug, tour)} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={styles.imageContainer}>
                  <Image 
                    src={normalizeImageUrl(tour.featured_image || getFirstHotelImage(tour))} 
                    alt={tour.name} 
                    width={320} 
                    height={400} 
                    className={styles.image}
                  />
                  <div className={styles.price}>От {tour.price} $</div>
                  <div className={styles.overlay}>
                    <div className={styles.tags}>
                      {Array.isArray(tour.tags) && tour.tags.map((tag, index) => (
                        <span key={index} className={styles.tag}>
                          {typeof tag === 'object' && tag.tag_text ? tag.tag_text : tag}
                        </span>
                      ))}
                    </div>
                    <h3 className={styles.packageName}>{tour.name}</h3>
                    <button className={styles.arrowBtn}>
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.7478 8.26334L10.7411 1.52675C10.7411 1.14505 10.4933 0.877197 10.0916 0.877197H3.35494C2.97994 0.877197 2.72548 1.16514 2.72548 1.48657C2.72548 1.808 3.01343 2.08255 3.32816 2.08255H5.65852L8.92638 1.97541L7.68083 3.06693L1.04468 9.71648C0.924142 9.83699 0.857178 9.99105 0.857178 10.1384C0.857178 10.4598 1.14512 10.7611 1.47994 10.7611C1.63397 10.7611 1.78129 10.7076 1.90182 10.5803L8.55135 3.93746L9.65626 2.68523L9.53575 5.81247V8.29014C9.53575 8.60488 9.81032 8.89951 10.1384 8.89951C10.4599 8.89951 10.7478 8.62499 10.7478 8.26334Z" fill="#253168" />
                      </svg>
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function PopularTours() {
  return (
    <Suspense fallback={
      <section className={styles.popularTours}>
        <div className={styles.container}>
          <h2 className={styles.title}>Популярные туры</h2>
          <div className={styles.cards}>
            <div className={styles.loading}>Загрузка туров...</div>
          </div>
        </div>
      </section>
    }>
      <PopularToursContent />
    </Suspense>
  );
} 