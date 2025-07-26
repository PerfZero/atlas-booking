import Link from 'next/link';
import styles from './Breadcrumbs.module.css';

export default function Breadcrumbs({ items }) {
  return (
    <nav className={styles.breadcrumbs}>
      {items.map((item, index) => (
        <div key={index} className={styles.breadcrumbItem}>
          {index > 0 && <span className={styles.separator}>/</span>}
          {item.href ? (
            <Link href={item.href} className={styles.breadcrumbLink}>
              {item.label}
            </Link>
          ) : (
            <span className={styles.breadcrumbText}>{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
} 