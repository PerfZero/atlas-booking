'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Image from 'next/image';
import styles from './BottomNavigation.module.css';

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();

  const navigationItems = [
    {
      id: 'home',
      label: 'Главная',
      icon: '/home.svg',
      path: '/',
      active: pathname === '/'
    },
    {
      id: 'search',
      label: 'Поиск',
      icon: '/search.svg',
      path: '/search',
      active: pathname === '/search'
    },
    {
      id: 'profile',
      label: isAuthenticated ? (user?.name || 'Профиль') : 'Войти',
      icon: isAuthenticated ? '/profile.svg' : '/enter.svg',
      path: isAuthenticated ? '/profile' : '/auth?mode=login',
      active: pathname === '/profile' || pathname === '/auth'
    }
  ];

  const handleNavigation = (item) => {
    router.push(item.path);
  };

  return (
    <nav className={styles.bottomNav}>
      {navigationItems.map((item) => (
        <button
          key={item.id}
          className={`${styles.navItem}${item.active ? ` ${styles.active}` : ''}`}
          onClick={() => handleNavigation(item)}
        >
          <div className={styles.navIcon}>
            <Image
              src={item.icon}
              alt={item.label}
              width={24}
              height={24}
            />
          </div>
          <span className={styles.navLabel}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
