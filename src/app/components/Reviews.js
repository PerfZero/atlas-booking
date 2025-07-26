import styles from './Reviews.module.css';

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
    }
  ];

  return (
    <section className={styles.reviews}>
      <div className={styles.container}>
        <h2 className={styles.title}>Отзывы наших паломников</h2>
        <div className={styles.videoGrid}>
          {reviews.map((review) => (
            <div key={review.id} className={styles.videoCard}>
              <iframe
                src={`https://www.youtube.com/embed/${review.videoId}?controls=0&modestbranding=1&rel=0`}
                title={review.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className={styles.videoFrame}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 