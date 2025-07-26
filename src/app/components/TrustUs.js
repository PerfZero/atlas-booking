import Image from 'next/image';
import styles from './TrustUs.module.css';

export default function TrustUs() {
  return (
    <section className={styles.trustUs}>
      <div className={styles.container}>
        <h2 className={styles.title}>Доверьтесь нам</h2>
        
        <div className={styles.stats}>
          <div className={styles.statBlock}>
            <div className={styles.icon}>
              <Image src="/trust.svg" alt="Статистика" width={40} height={40} />
            </div>
            <div className={styles.value}>70 000+</div>
            <p className={styles.description}>
              Мусульман доверили нам свое совершение Умры и Хаджа.
            </p>
          </div>
          
          <div className={styles.statBlock}>
            <div className={styles.icon}>
              <Image src="/trust.svg" alt="Статистика" width={40} height={40} />
            </div>
            <div className={styles.value}>Более 16 лет</div>
            <p className={styles.description}>
              Опыта на рынке организации паломничества.
            </p>
          </div>
          
          <div className={styles.statBlock}>
            <div className={styles.icon}>   
              <Image src="/trust.svg" alt="Статистика" width={40} height={40} />
            </div>
            <div className={styles.value}>91%</div>
            <p className={styles.description}>
              Из наших клиентов совершили паломничество впервые.
            </p>
          </div>
          
          <div className={styles.statBlock}>
            <div className={styles.icon}>
              <Image src="/trust.svg" alt="Статистика" width={40} height={40} />
            </div>
            <div className={styles.value}>99%</div>
            <p className={styles.description}>
              Наших паломников высоко оценили наш сервис.
            </p>
          </div>
          
          <div className={styles.statBlock}>
            <div className={styles.icon}>
              <Image src="/trust.svg" alt="Статистика" width={40} height={40} />
            </div>
            <div className={styles.value}>100%</div>
            <p className={styles.description}>
              Персонализированные туры: полный учет пожеланий клиента.
            </p>
          </div>
          
          <div className={styles.statBlock}>
            <div className={styles.icon}>
              <Image src="/trust.svg" alt="Статистика" width={40} height={40} />
            </div>
            <div className={styles.value}>99%</div>
            <p className={styles.description}>
              Клиентов рекомендуют нас за высокий уровень удовлетворенности.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 