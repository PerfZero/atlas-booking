import styles from './Error.module.css';

export default function Error({ 
  message = 'Произошла ошибка', 
  onRetry, 
  showRetry = true 
}) {
  return (
    <div className={styles.error}>
      <div className={styles.icon}>⚠️</div>
      <h3 className={styles.title}>Ошибка</h3>
      <p className={styles.message}>{message}</p>
      {showRetry && onRetry && (
        <button onClick={onRetry} className={styles.retryButton}>
          Попробовать снова
        </button>
      )}
    </div>
  );
} 