'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNavigation from '../components/BottomNavigation';
import styles from './page.module.css';

function KaspiPaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState('loading');
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    
    if (orderId) {
      checkPaymentStatus(orderId);
    } else {
      setPaymentStatus('error');
    }
  }, [searchParams]);

  const checkPaymentStatus = async (orderId) => {
    try {
              const response = await fetch(`https://booking.devdenis.ru/wp-json/atlas/v1/kaspi/payment-status?order_id=${orderId}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setPaymentData(data.payment);
        setPaymentStatus(data.payment.status === 'completed' ? 'success' : 'pending');
      } else {
        setPaymentStatus('error');
      }
    } catch (error) {
      console.error('Ошибка проверки статуса платежа:', error);
      setPaymentStatus('error');
    }
  };

  const handleGoToProfile = () => {
    router.push('/profile');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  if (paymentStatus === 'loading') {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <div className={styles.container}>
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Проверяем статус платежа...</p>
            </div>
          </div>
        </main>
        <Footer />
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.content}>
            {paymentStatus === 'success' && (
              <div className={styles.successCard}>
                <div className={styles.successIcon}>
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="32" cy="32" r="32" fill="#4CAF50"/>
                    <path d="M20 32L28 40L44 24" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h1>Оплата прошла успешно!</h1>
                <p>Ваш тур забронирован и оплачен</p>
                
                {paymentData && (
                  <div className={styles.paymentDetails}>
                    <div className={styles.detailItem}>
                      <span>Номер заказа:</span>
                      <span>{paymentData.order_id}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Сумма:</span>
                      <span>{paymentData.amount?.toLocaleString()} ₸</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Дата оплаты:</span>
                      <span>{new Date(paymentData.completed_at).toLocaleDateString('ru-RU')}</span>
                    </div>
                  </div>
                )}

                <div className={styles.actions}>
                  <button className={styles.primaryButton} onClick={handleGoToProfile}>
                    Перейти в профиль
                  </button>
                  <button className={styles.secondaryButton} onClick={handleGoHome}>
                    На главную
                  </button>
                </div>
              </div>
            )}

            {paymentStatus === 'pending' && (
              <div className={styles.pendingCard}>
                <div className={styles.pendingIcon}>
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="32" cy="32" r="32" fill="#FF9800"/>
                    <path d="M32 16V32L44 44" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h1>Платеж обрабатывается</h1>
                <p>Пожалуйста, подождите. Мы обрабатываем ваш платеж.</p>
                
                <div className={styles.actions}>
                  <button className={styles.primaryButton} onClick={() => window.location.reload()}>
                    Обновить статус
                  </button>
                  <button className={styles.secondaryButton} onClick={handleGoToProfile}>
                    Перейти в профиль
                  </button>
                </div>
              </div>
            )}

            {paymentStatus === 'error' && (
              <div className={styles.errorCard}>
                <div className={styles.errorIcon}>
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="32" cy="32" r="32" fill="#F44336"/>
                    <path d="M20 20L44 44M44 20L20 44" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h1>Ошибка при проверке платежа</h1>
                <p>Не удалось проверить статус платежа. Обратитесь в поддержку.</p>
                
                <div className={styles.actions}>
                  <button className={styles.primaryButton} onClick={handleGoToProfile}>
                    Перейти в профиль
                  </button>
                  <button className={styles.secondaryButton} onClick={handleGoHome}>
                    На главную
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}

export default function KaspiPaymentSuccess() {
  return (
    <Suspense fallback={
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <div className={styles.container}>
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Загрузка...</p>
            </div>
          </div>
        </main>
        <Footer />
        <BottomNavigation />
      </div>
    }>
      <KaspiPaymentSuccessContent />
    </Suspense>
  );
}
