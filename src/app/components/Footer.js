import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.contactSection}>
          <p className={styles.contactText}>
            Если Вам нужна дополнительная информация, свяжитесь с нами по номеру{' '}
            <a href="tel:+77021510000" className={styles.phoneLink}>
              +7 702 151 0000
            </a>
          </p>
        </div>
        
        <div className={styles.divider}></div>
        
        <div className={styles.bottomSection}>
          <div className={styles.copyright}>
            © Atlas Tourism 2025
          </div>
         
        </div>
      </div>
    </footer>
  );
} 