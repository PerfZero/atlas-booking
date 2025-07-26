import { useEffect } from 'react';
import styles from './Toast.module.css';

export default function Toast({ message, visible, onClose, duration = 2500 }) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [visible, duration, onClose]);

  if (!visible) return null;

  return (
    <div className={styles.toast} onClick={onClose}>
      {message}
    </div>
  );
} 