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
  const reviews = [
    { 
      id: 1, 
      videoId: "jfKfPfyJRdk",
      title: "Отзыв паломника 1"
    },
    { 
      id: 2, 
      videoId: "dQw4w9WgXcQ",
      title: "Отзыв паломника 2"
    },
    { 
      id: 3, 
      videoId: "kJQP7kiw5Fk",
      title: "Отзыв паломника 3"
    },
    { 
      id: 4, 
      videoId: "9bZkp7q19f0",
      title: "Отзыв паломника 4"
    },
    { 
      id: 5, 
      videoId: "ZZ5LpwO-An4",
      title: "Отзыв паломника 5"
    },
    { 
      id: 6, 
      videoId: "y6120QOlsfU",
      title: "Отзыв паломника 6"
    },
    { 
      id: 7, 
      videoId: "jfKfPfyJRdk",
      title: "Отзыв паломника 7"
    },
    { 
      id: 8, 
      videoId: "dQw4w9WgXcQ",
      title: "Отзыв паломника 8"
    }
  ];

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