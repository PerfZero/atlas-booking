'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './HeaderBlue.module.css';

export default function HeaderBlue({ invertLogo = false, buttonStyle = 'default', tourTitle = 'Оформление тура' }) {
  const router = useRouter();
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
          <div className={`${styles.logoInverted} ${invertLogo ? styles.logoInverted : ''}`}>
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
            
            <button className={`${styles.registerBtnSearch} ${buttonStyle === 'search' ? styles.registerBtnSearch : ''}`}>
              Зарегистрироваться
            </button>
            
            <button className={`${styles.loginBtnSearch} ${buttonStyle === 'search' ? styles.loginBtnSearch : ''}`}>
              Войти
            </button>
          </div>
        </div>
                 <div className={styles.secondHeader}> 
           <h1 className={styles.title}> 
      
             Личный кабинет <span>Nuraly Kopbossyn</span>
           </h1>
         </div>
      </header>
     
    </>
  );
}
