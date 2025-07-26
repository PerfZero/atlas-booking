'use client';
import { Suspense } from 'react';
import SearchForm from './SearchForm';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <div className={styles.textContent}>
          <h1 className={styles.title}>Умра в 3 клика.</h1>
          <h2 className={styles.title}>Вместе с Atlas Tourism.</h2>
          <p className={styles.description}>
            Сравните пакеты, выберите подходящий тур и отправьтесь в духовное путешествие без стресса.
          </p>
        </div>
        
        <div className={styles.formContainer}>
          <Suspense fallback={<div>Loading...</div>}>
            <SearchForm />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
