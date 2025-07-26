import Image from 'next/image';
import styles from './Header.module.css';

export default function Header({ invertLogo = false, buttonStyle = 'default' }) {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={`${styles.logo} ${invertLogo ? styles.logoInverted : ''}`}>
          <Image
            src="/logo.svg"
            alt="Atlas Hajj"
            width={120}
            height={40}
            priority
          />
        </div>
        
        <div className={styles.nav}>
          <div className={styles.languageIcon}>
            <Image
              src="/flag_ru.svg"
              alt="Русский язык"
              width={24}
              height={24}
            />
          </div>
          
          <button className={`${styles.registerBtn} ${buttonStyle === 'search' ? styles.registerBtnSearch : ''}`}>
            Зарегистрироваться
          </button>
          
          <button className={`${styles.loginBtn} ${buttonStyle === 'search' ? styles.loginBtnSearch : ''}`}>
            Войти
          </button>
        </div>
      </div>
    </header>
  );
} 