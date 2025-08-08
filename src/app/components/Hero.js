'use client';
import { Suspense } from 'react';
import SearchForm from './SearchForm';
import Loading from '../../components/ui/Loading';
import styles from './Hero.module.css';

export default function Hero() {
  const heroData = {
    title1: 'Умра в 3 клика.',
    title2: 'Вместе с Atlas Tourism.',
    description: 'Сравните пакеты, выберите подходящий тур и отправьтесь в духовное путешествие без стресса.'
  };

  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <div className={styles.textContent}>
          <h1 className={styles.title}>{heroData.title1}</h1>
          <h2 className={styles.title}>{heroData.title2}</h2>
          <p className={styles.description}>
            {heroData.description}
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
