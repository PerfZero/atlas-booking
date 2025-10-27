'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './Reviews.module.css';

function LazyVideo({ review }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div ref={videoRef} className={styles.videoCard}>
      {!isVisible ? (
        <div className={styles.videoPlaceholder}>
          <div className={styles.playButton}>▶</div>
          <span className={styles.placeholderText}>Загрузка видео...</span>
        </div>
      ) : (
        <>
          {!isLoaded && (
            <div className={styles.videoPlaceholder}>
              <div className={styles.playButton}>▶</div>
              <span className={styles.placeholderText}>Загрузка видео...</span>
            </div>
          )}
          <iframe
            src={`https://www.youtube.com/embed/${review.videoId}?controls=0&modestbranding=1&rel=0`}
            title={review.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className={`${styles.videoFrame} ${isLoaded ? styles.loaded : ''}`}
            onLoad={handleLoad}
          />
        </>
      )}
    </div>
  );
}

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('https://booking.atlas.kz/wp-json/atlas-hajj/v1/pilgrim-reviews');
        if (!response.ok) throw new Error('Ошибка загрузки отзывов');
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error('Ошибка получения отзывов:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return (
      <section className={styles.reviews}>
        <div className={styles.container}>
          <h2 className={styles.title}>Отзывы наших паломников</h2>
          <div className={styles.videoGrid}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={styles.videoCard}>
                <div className={styles.videoPlaceholder}>
                  <div className={styles.playButton}>▶</div>
                  <span className={styles.placeholderText}>Загрузка...</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <section className={styles.reviews}>
      <div className={styles.container}>
        <h2 className={styles.title}>Отзывы наших паломников</h2>
        <div className={styles.videoGrid}>
          {reviews.map((review) => (
            <LazyVideo key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
} 