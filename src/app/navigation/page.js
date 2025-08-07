"use client";
import Link from 'next/link';
import styles from './page.module.css';

export default function NavigationPage() {
  const pages = [
    {
      title: "Главная страница",
      description: "Лендинг с поиском туров и основной информацией",
      path: "/",
      status: "Готово"
    },
    {
      title: "Поиск туров",
      description: "Страница с результатами поиска и фильтрами",
      path: "/search",
      status: "Готово"
    },
    {
      title: "Детальная страница тура",
      description: "Подробная информация о конкретном туре",
      path: "/tour/summer-umrah-deluxe",
      status: "Готово"
    },
    {
      title: "Личный кабинет",
      description: "Профиль пользователя с данными и забронированными турами",
      path: "/profile",
      status: "Готово"
    },
    {
      title: "Оформление бронирования",
      description: "Страница оформления тура",
      path: "/booking?id=5&name=Summer+Umrah+Deluxe&price=3+200+%24&priceValue=3200&oldPrice=3+400+%24&duration=5+дня+в+Медине+·+5+дня+в+Мекке&departure=Алматы&date=1-10+августа+2025&type=Умра&image=%2Ftour_1.png&rating=9.8&reviews=167&features=Всё+включено%2CПрямой+рейс%2C5*+отель+в+Мекке%2CРасстояние+до+Каабы+20+м.%2C5*+отель+в+Медине%2CРасстояние+до+мечети+50+м.&slug=summer-umrah-deluxe",
      status: "Готово"
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Навигация по сайту</h1>
        <p className={styles.subtitle}>Все доступные страницы для демонстрации</p>
      </div>

      <div className={styles.pagesGrid}>
        {pages.map((page, index) => (
          <div key={index} className={styles.pageCard}>
            <div className={styles.pageHeader}>
              <h3 className={styles.pageTitle}>{page.title}</h3>
              <span className={`${styles.status} ${styles[page.status.toLowerCase()]}`}>
                {page.status}
              </span>
            </div>
            <p className={styles.pageDescription}>{page.description}</p>
            <Link href={page.path} className={styles.pageLink}>
              Открыть страницу →
            </Link>
          </div>
        ))}
      </div>

      <div className={styles.info}>
        <h2>Информация для клиента</h2>
        <ul>
          <li>Все страницы адаптивны и работают на мобильных устройствах</li>
          <li>Реализована система табов в личном кабинете</li>
                     <li>Работающие таймеры на странице &quot;Туры ожидающие оплаты&quot;</li>
          <li>Интерактивные элементы и анимации</li>
          <li>Современный дизайн в соответствии с брендингом</li>
        </ul>
      </div>
    </div>
  );
}
