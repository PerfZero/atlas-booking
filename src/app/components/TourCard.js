import styles from '../search/page.module.css';
import Link from 'next/link';

export default function TourCard({ tour }) {
  const tourSlug = tour.name.toLowerCase().replace(/\s+/g, '-').replace('package', 'package');
  
  return (
    <div className={styles.tourCard}>
      <Link href={`/tour/${tourSlug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className={styles.tourImage}>
          <div className={styles.cardBadge}>
            <span className={styles.badgeIcon}><img src="/chos.svg" alt="★" /></span>
            <span>Выбор паломников</span>
          </div>
          <img src={tour.image} alt={tour.name} />
          <div className={styles.imageOverlay}>
            <div className={styles.tourTags}>
              {tour.tags.map((tag, index) => (
                <span key={index} className={styles.tag}>{tag}</span>
              ))}
            </div>
            <h4 className={styles.tourName}>{tour.name}</h4>
            <div className={styles.externalIcon}>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.7481 8.26334L10.7414 1.52675C10.7414 1.14505 10.4936 0.877197 10.0918 0.877197H3.35519C2.98019 0.877197 2.72572 1.16514 2.72572 1.48657C2.72572 1.808 3.01367 2.08255 3.3284 2.08255H5.65876L8.92662 1.97541L7.68108 3.06693L1.04492 9.71648C0.924386 9.83699 0.857422 9.99105 0.857422 10.1384C0.857422 10.4598 1.14537 10.7611 1.48019 10.7611C1.63421 10.7611 1.78153 10.7076 1.90206 10.5803L8.55159 3.93746L9.65651 2.68523L9.53599 5.81247V8.29014C9.53599 8.60488 9.81057 8.89951 10.1387 8.89951C10.4601 8.89951 10.7481 8.62499 10.7481 8.26334Z" fill="#253168" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
      <div className={styles.tourContent}>
        <div className={styles.contentHeader}>
          <h4 className={styles.tourDuration}>{tour.duration}</h4>
          <div className={styles.tourRating}>
            <div className={styles.ratingCircle}>
              <span>{tour.rating}</span>
            </div>
          </div>
        </div>
        <div className={styles.featureButtons}>
          <div className={styles.allInclusiveBtn}>
            <span className={styles.featureIcon}><img src="/all.svg" alt="★" /></span>
            <span>Всё включено</span>
          </div>
          {tour.spotsLeft && (
            <div className={styles.spotsLeft}>
              <span className={styles.spotsIcon}><img src="/alert.svg" alt="★" /></span>
              <span>Осталось {tour.spotsLeft} мест</span>
            </div>
          )}
        </div>
        <div className={styles.tourFeatures}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}><img src="/airplane.svg" alt="★" /></span>
            <span className={styles.featureText}>Прямой рейс</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}><img src="/mekka.svg" alt="★" /></span>
            <div className={styles.featureTextContainer}>
              <span className={styles.featureText}>5★ отель в Мекке</span>
              <span className={styles.featureSubtext}>Расстояние до Каабы 50 м.</span>
            </div>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}><img src="/medina.svg" alt="★" /></span>
            <div className={styles.featureTextContainer}>
              <span className={styles.featureText}>5★ отель в Медине</span>
              <span className={styles.featureSubtext}>Расстояние до мечети 150 м.</span>
            </div>
          </div>
        </div>
        <div className={styles.tourPrice}>
          <div className={styles.priceNote}>Без скрытых платежей</div>
          <div className={styles.priceInfo}>
            <span className={styles.currentPrice}>От ${tour.price.replace(' $', '')}</span>
            {tour.oldPrice && (
              <span className={styles.oldPrice}>{tour.oldPrice}</span>
            )}
          </div>
          <div className={styles.priceEquivalent}>~1 312 500T</div>
        </div>
        <Link href={`/tour/${tourSlug}`} className={styles.viewOptionsBtn}>
          <button>Посмотреть варианты</button>
        </Link>
      </div>
    </div>
  );
} 