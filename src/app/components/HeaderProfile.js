'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import styles from './HeaderBlue.module.css';

export default function HeaderProfile({ invertLogo = false, buttonStyle = 'default' }) {
  const router = useRouter();
  const { isAuthenticated, user, logout, loading } = useAuth();
  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <div 
            className={`${styles.logoInverted} ${invertLogo ? styles.logoInverted : ''}`}
            onClick={() => router.push('/')}
            style={{ cursor: 'pointer' }}
          >
            <Image
              src="/logo.svg"
              alt="Atlas Hajj"
              width={120}
              height={40}
              priority
            />
          </div>
          
          <div className={styles.nav}>
            {!loading && isAuthenticated ? (
              <button 
                className={`${styles.loginBtnSearch} ${buttonStyle === 'search' ? styles.loginBtnSearch : ''}`}
                onClick={() => router.push('/profile')}
              >
                {user?.name || 'Профиль'}
              </button>
            ) : !loading && (
              <button 
                className={`${styles.loginBtnSearch} ${buttonStyle === 'search' ? styles.loginBtnSearch : ''}`}
                onClick={() => router.push('/auth?mode=login')}
              >
                Авторизоваться
              </button>
            )}
          </div>
        </div>
                                  <div className={styles.secondHeader}> 
           <h1 className={styles.title}> 
       
             Личный кабинет <span>{user?.name || 'Пользователь'}</span>
           </h1>
         </div>
      </header>
     
    </>
  );
}
