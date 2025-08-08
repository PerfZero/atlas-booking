'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import styles from './HeaderBlue.module.css';

export default function HeaderProfile({ invertLogo = false, buttonStyle = 'default' }) {
  const router = useRouter();
  const { isAuthenticated, user, logout, loading } = useAuth();
  const [currentLanguage, setCurrentLanguage] = useState('ru');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const languageRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setShowLanguageDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
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
            <div className={styles.languageContainer} ref={languageRef}>
              <div 
                className={styles.languageIcon}
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              >
                <Image
                  src={currentLanguage === 'ru' ? "/flag_ru.svg" : "/flag_kz.svg"}
                  alt={currentLanguage === 'ru' ? "Русский язык" : "Қазақ тілі"}
                  width={24}
                  height={24}
                />
              </div>
              
              {showLanguageDropdown && (
                <div className={styles.languageDropdown}>
                  <div 
                    className={`${styles.languageOption} ${currentLanguage === 'ru' ? styles.active : ''}`}
                    onClick={() => {
                      setCurrentLanguage('ru');
                      setShowLanguageDropdown(false);
                    }}
                  >
                    <Image
                      src="/flag_ru.svg"
                      alt="Русский язык"
                      width={20}
                      height={20}
                    />
                    <span>Русский</span>
                  </div>
                  <div 
                    className={`${styles.languageOption} ${currentLanguage === 'kz' ? styles.active : ''}`}
                    onClick={() => {
                      setCurrentLanguage('kz');
                      setShowLanguageDropdown(false);
                    }}
                  >
                    <Image
                      src="/flag_kz.svg"
                      alt="Қазақ тілі"
                      width={20}
                      height={20}
                    />
                    <span>Қазақша</span>
                  </div>
                </div>
              )}
            </div>
            
            {!loading && isAuthenticated ? (
              <>
                <button 
                  className={`${styles.loginBtnSearch} ${buttonStyle === 'search' ? styles.loginBtnSearch : ''}`}
                  onClick={() => router.push('/profile')}
                >
                  {user?.name || 'Профиль'}
                </button>
                <button 
                  className={`${styles.registerBtnSearch} ${buttonStyle === 'search' ? styles.registerBtnSearch : ''}`}
                  onClick={() => {
                    logout();
                    router.push('/');
                  }}
                >
                  Выйти
                </button>
              </>
            ) : !loading && (
              <>
                <button 
                  className={`${styles.registerBtnSearch} ${buttonStyle === 'search' ? styles.registerBtnSearch : ''}`}
                  onClick={() => router.push('/auth?mode=register')}
                >
                  Зарегистрироваться
                </button>
                
                <button 
                  className={`${styles.loginBtnSearch} ${buttonStyle === 'search' ? styles.loginBtnSearch : ''}`}
                  onClick={() => router.push('/auth?mode=login')}
                >
                  Войти
                </button>
              </>
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
