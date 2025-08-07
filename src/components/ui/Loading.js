import styles from './Loading.module.css';

export default function Loading({ text = 'Загрузка...', size = 'medium' }) {
  return (
    <div className={`${styles.loading} ${styles[size]}`}>
      <div className={styles.spinner}></div>
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
} 