'use client';
import { Suspense } from 'react';
import SearchForm from './SearchForm';
import Loading from '../../components/ui/Loading';
import Error from '../../components/ui/Error';
import styles from './Hero.module.css';
import { useHomePageSettings } from '../../hooks/useWordPress';

export default function Hero() {
  const { data: heroData, loading, error, refetch } = useHomePageSettings();

  const defaultData = {
    title1: 'Умра в 3 клика.',
    title2: 'Вместе с Atlas Tourism.',
    description: 'Сравните пакеты, выберите подходящий тур и отправьтесь в духовное путешествие без стресса.'
  };

  const displayData = {
    title1: heroData?.acf?.hero_title_1 || defaultData.title1,
    title2: heroData?.acf?.hero_title_2 || defaultData.title2,
    description: heroData?.acf?.hero_description || defaultData.description
  };

  if (loading) {
    return (
      <section className={styles.hero}>
        <div className={styles.content}>
          <Loading text="Загрузка данных..." />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.hero}>
        <div className={styles.content}>
          <Error 
            message="Не удалось загрузить данные с сервера" 
            onRetry={refetch}
          />
        </div>
      </section>
    );
  }

  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <div className={styles.textContent}>
          <h1 className={styles.title}>{displayData.title1}</h1>
          <h2 className={styles.title}>{displayData.title2}</h2>
          <p className={styles.description}>
            {displayData.description}
          </p>
        </div>
        
        <div className={styles.formContainer}>
          <Suspense fallback={<Loading size="small" />}>
            <SearchForm />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
