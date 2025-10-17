import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import styles from '../search/page.module.css';

export default function TourCardSkeleton() {
  return (
    <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
      <div className={styles.tourCard}>
        <div className={styles.tourImage}>
          <Skeleton height="100%" />
        </div>
        <div className={styles.tourContent}>
          <div className={styles.contentHeader}>
            <Skeleton height={32} width="70%" />
            <Skeleton height={40} width={40} borderRadius="16px 16px 16px 0" />
          </div>
          
          <div className={styles.featureButtons}>
            <Skeleton height={40} width={169} borderRadius={8} />
            <Skeleton height={40} width={120} borderRadius={8} />
          </div>
          
          <div className={styles.tourFeatures}>
            <div className={styles.feature}>
              <Skeleton height={16} width={16} circle />
              <Skeleton height={16} width="60%" />
            </div>
            <div className={styles.feature}>
              <Skeleton height={16} width={16} circle />
              <div className={styles.featureTextContainer}>
                <Skeleton height={16} width="80%" />
                <Skeleton height={12} width="60%" />
              </div>
            </div>
            <div className={styles.feature}>
              <Skeleton height={16} width={16} circle />
              <div className={styles.featureTextContainer}>
                <Skeleton height={16} width="80%" />
                <Skeleton height={12} width="60%" />
              </div>
            </div>
          </div>
          
          <div className={styles.tourPrice}>
            <Skeleton height={12} width="60%" />
            <div className={styles.priceInfo}>
              <Skeleton height={24} width="30%" />
              <Skeleton height={16} width="20%" />
            </div>
            <Skeleton height={10} width="40%" />
          </div>
          
          <Skeleton height={44} width="100%" borderRadius={8} />
        </div>
      </div>
    </SkeletonTheme>
  );
}


