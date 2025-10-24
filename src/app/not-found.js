'use client';

import { useRouter } from 'next/navigation';
import Header from './components/Header';
import Footer from './components/Footer';
import BottomNavigation from './components/BottomNavigation';
import styles from './not-found.module.css';

export default function NotFound() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.errorCard}>
              <div className={styles.errorIcon}>
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="40" cy="40" r="40" fill="#F44336"/>
                  <path d="M25 25L55 55M55 25L25 55" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1>Страница не найдена</h1>
              <p>К сожалению, запрашиваемая страница не существует или была перемещена.</p>
              
              <div className={styles.actions}>
                <button className={styles.primaryButton} onClick={handleGoHome}>
                  На главную
                </button>
                <button className={styles.secondaryButton} onClick={handleGoBack}>
                  Назад
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
