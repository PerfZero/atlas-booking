"use client";
import { notFound } from "next/navigation";
import { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SearchForm from "../../components/SearchForm";
import Breadcrumbs from "../../components/Breadcrumbs";
import styles from "./page.module.css";

const tours = [
  {
    slug: "fairmont-package",
    id: 1,
    name: "Fairmont Package",
    price: "2 400 $",
    priceValue: 2400,
    oldPrice: "2 500 $",
    duration: "3 дня в Медине · 3 дня в Мекке",
    departure: "Алматы",
    departureValue: "almaty",
    date: "15 января 2024",
    dateValue: "january",
    type: "Умра",
    typeValue: "umrah",
    image: "/tour_1.png",
    rating: 9.3,
    reviews: 124,
    spotsLeft: 9,
    features: [
      "Всё включено",
      "Прямой рейс",
      "5* отель в Мекке",
      "Расстояние до Каабы 50 м.",
      "5* отель в Медине",
      "Расстояние до мечети 150 м.",
    ],
    tags: ["Умра", "Возможен номер с видом на Каабу"],
  },
  {
    slug: "address-package",
    id: 2,
    name: "Address Package",
    price: "2 200 $",
    priceValue: 2200,
    oldPrice: "2 300 $",
    duration: "3 дня в Медине · 3 дня в Мекке",
    departure: "Астана",
    departureValue: "astana",
    date: "20 января 2024",
    dateValue: "january",
    type: "Умра",
    typeValue: "umrah",
    image: "/tour_2.png",
    rating: 9.1,
    reviews: 89,
    spotsLeft: 12,
    features: [
      "Всё включено",
      "Прямой рейс",
      "5* отель в Мекке",
      "Расстояние до Каабы 100 м.",
      "4* отель в Медине",
      "Расстояние до мечети 200 м.",
    ],
    tags: ["Умра"],
  },
  {
    slug: "swissotel-package",
    id: 3,
    name: "Swissotel Package",
    price: "2 800 $",
    priceValue: 2800,
    oldPrice: "3 000 $",
    duration: "3 дня в Медине · 3 дня в Мекке",
    departure: "Алматы",
    departureValue: "almaty",
    date: "25 января 2024",
    dateValue: "january",
    type: "Умра",
    typeValue: "umrah",
    image: "/tour_3.png",
    rating: 9.5,
    reviews: 156,
    spotsLeft: 5,
    features: [
      "Всё включено",
      "Прямой рейс",
      "5* отель в Мекке",
      "Расстояние до Каабы 30 м.",
      "5* отель в Медине",
      "Расстояние до мечети 100 м.",
    ],
    tags: ["Умра", "Премиум"],
  },
  {
    slug: "marriott-package",
    id: 4,
    name: "Marriott Package",
    price: "2 100 $",
    priceValue: 2100,
    oldPrice: "2 200 $",
    duration: "3 дня в Медине · 3 дня в Мекке",
    departure: "Шымкент",
    departureValue: "shymkent",
    date: "30 января 2024",
    dateValue: "january",
    type: "Умра",
    typeValue: "umrah",
    image: "/tour_4.png",
    rating: 8.9,
    reviews: 67,
    spotsLeft: 15,
    features: [
      "Всё включено",
      "С пересадкой",
      "4* отель в Мекке",
      "Расстояние до Каабы 200 м.",
      "4* отель в Медине",
      "Расстояние до мечети 300 м.",
    ],
    tags: ["Умра", "Эконом"],
  },
];

export default function TourDetailPage({ params }) {
  const tour = tours.find((t) => t.slug === params.slug);
  if (!tour) return notFound();

  const [showNotification, setShowNotification] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: tour.name,
          text: `${tour.name} - ${tour.duration}`,
          url: window.location.href,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Ошибка при использовании Share API:", err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 2000);
      } catch (err) {
        console.error("Ошибка копирования ссылки:", err);
      }
    }
  };

  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Результат поиска", href: "/search" },
    { label: tour.name },
  ];

  return (
    <div className={styles.page}>
      <Header invertLogo={true} buttonStyle="search" />

      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.titleSection}>
              <h1 className={styles.title}>
                Умра в 3 клика. Вместе с Atlas Tourism.
              </h1>
            </div>

            <div className={styles.searchFormWrapper}>
              <SearchForm />
            </div>
          </div>

          <Breadcrumbs items={breadcrumbItems} />

          <div className={styles.tourHeaderBlock}>
            <span className={styles.tourHeaderName}>{tour.name} </span>
            <span className={styles.tourHeaderDuration}>-</span>
            <span className={styles.tourHeaderDuration}>{tour.duration}</span>
            <span className={styles.tourHeaderRating}>{tour.rating}</span>
            <button className={styles.tourHeaderShare} onClick={handleShare}>
              <img src="/share.svg" alt="share" />
              Поделиться
            </button>
          </div>

          {showNotification && (
            <div className={styles.notification}>
              <span>Ссылка скопирована!</span>
              <img src="/check.svg" alt="check" />
            </div>
          )}

          <div className={styles.tourGallery}>
            <div className={styles.galleryGrid}>
              <div className={styles.mainImage}>
                <img src="/tour_1.png" alt="Мечеть Аль-Харам" />
              </div>
              <div className={styles.sideImages}>
                <div className={styles.sideImage}>
                  <img src="/tour_2.png" alt="Лобби отеля" />
                </div>
                <div className={styles.sideImage}>
                  <img src="/tour_3.png" alt="Вид из ресторана" />
                </div>
                <div className={styles.sideImage}>
                  <img src="/tour_4.png" alt="Номер отеля" />
                </div>
                <div className={styles.sideImage}>
                  <img src="/tour_1.png" alt="Вид на мечеть" />
                  <button className={styles.viewAllPhotos}>
                    <img src="/photos.svg" alt="eye" />
                    Посмотреть все фото
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.tourFeatures}>
            <div className={styles.featureItem}>
              <img src="/done.svg" alt="check" />
              <span>Всё включено</span>
            </div>
            <div className={styles.featureItem}>
              <span>Прямой рейс</span>
            </div>
            <div className={styles.featureItem}>
              <span>50 м до Каабы</span>
            </div>
            <div className={styles.featureItem}>
              <span>Сопровождение гида</span>
            </div>
            <div className={styles.featureItem}>
              <span>5 и 4 звездочные отели</span>
            </div>
            <div className={styles.featureItem}>
              <span>Высокоскоростной поезд</span>
            </div>
          </div>

          <div className={styles.tourStats}>
            <div className={styles.statsLeft}>
              <img src="/gold.svg" alt="gold" />
            </div>

            <div className={styles.statsMiddle}>
              <span>Этот пакет — один из самых</span>
              <span>любимых у клиентов Atlas Tourism</span>
            </div>

            <span className={styles.statSeparator}>|</span>

            <div className={styles.statItem}>
              <span className={styles.statNumber}>382</span>
              <div className={styles.statText}>
                <span>Паломников выбрали</span>
                <span>Fairmont Package</span>
              </div>
            </div>

            <span className={styles.statSeparator}>|</span>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>291</span>
              <div className={styles.statText}>
                <span>Отзывы паломников</span>
                <span className={styles.statLink}>Посмотреть</span>
              </div>
            </div>
          </div>

          <div className={styles.flightInfo}>
            <div className={styles.flightHeader}>
              <div className={styles.flightTitle}>
                <img src="/airplane.svg" alt="airplane" />
                <span>Данные о перелете</span>
              </div>
              <div className={styles.flightType}>
                <span>Прямой рейс</span>
              </div>
            </div>

            <div className={styles.flightSections}>
              <div className={styles.flightSection}>
                <div className={styles.flightSectionHeader}>
                  <h3>Туда</h3>
                  <img src="/start_fly.svg" alt="airplane" />
                </div>

                <div className={styles.airlineInfo}>
                  <div className={styles.airlineTag}>
                    <img src="/air_astana.svg" alt="airplane" />
                  </div>
                  <div className={styles.flightNumber}>
                    <span>KC 911</span>
                  </div>
                </div>

                <div className={styles.routeInfo}>
                  <div className={styles.airport}>
                    <span className={styles.city}>Almaty</span>
                    <span className={styles.code}>ALA</span>
                  </div>
                  <div className={styles.flightPath}>
                    <img src="/flight.svg" alt="flight" />
                  </div>
                  <div className={styles.airport}>
                    <span className={styles.city}>Madinah</span>
                    <span className={styles.code}>MED</span>
                  </div>
                </div>

                <div className={styles.duration}>
                  <span>Время в пути 6 ч 20 м</span>
                </div>

                <div className={styles.timeInfo}>
                  <div className={styles.departure}>
                    <span>Вылет</span>
                    <span className={styles.time}>10:00</span>
                    <span className={styles.date}>Пн, 19 июня</span>
                  </div>
                  <div className={styles.arrival}>
                    <span>Прилет</span>
                    <span className={styles.time}>20:00</span>
                    <span className={styles.date}>Вт, 19 июня</span>
                  </div>
                </div>
              </div>

              <div className={styles.flightSection}>
                <div className={styles.flightSectionHeader}>
                  <h3>Обратно</h3>
                  <img src="/finish_fly.svg" alt="airplane" />
                </div>

                <div className={styles.airlineInfo}>
                  <div className={styles.airlineTag}>
                    <img src="/air_astana.svg" alt="airplane" />
                  </div>
                  <div className={styles.flightNumber}>
                    <span>KC 911</span>
                  </div>
                </div>

                <div className={styles.routeInfo}>
                  <div className={styles.airport}>
                    <span className={styles.city}>Madinah</span>
                    <span className={styles.code}>MED</span>
                  </div>
                  <div className={styles.flightPath}>
                    <img src="/flight.svg" alt="flight" />
                  </div>
                  <div className={styles.airport}>
                    <span className={styles.city}>Almaty</span>
                    <span className={styles.code}>ALA</span>
                  </div>
                </div>

                <div className={styles.duration}>
                  <span>Время в пути 6 ч 20 м</span>
                </div>

                <div className={styles.timeInfo}>
                  <div className={styles.departure}>
                    <span>Вылет</span>
                    <span className={styles.time}>10:00</span>
                    <span className={styles.date}>Пн, 19 июня</span>
                  </div>
                  <div className={styles.arrival}>
                    <span>Прилет</span>
                    <span className={styles.time}>20:00</span>
                    <span className={styles.date}>Вт, 19 июня</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.flightInfo}>
            <div className={styles.flightHeader}>
              <div className={styles.flightTitle}>
                <img src="/bad.svg" alt="airplane" />
                <span>Информация о проживании</span>
              </div>
              <div className={styles.flightType}>
                <span>Лучшие отели</span>
              </div>
            </div>

            <div className={styles.flightSections}>
              <div className={styles.flightSection}>
                <div className={styles.flightSectionHeader}>
                  <h3>Проживание в Мекке · <span className={styles.flightSectionTitle}>Fairmont Makkah</span></h3>
                  <img src="/mekka.svg" alt="airplane" />
                </div>

                <div className={styles.hotelOverview}>
                  <div className={styles.hotelBrand}>
                   <img src="/fairmont.svg" alt="airplane" />
                  </div>
                  <div className={styles.hotelDistance}>
                    <span className={styles.distanceNumber}>50 м</span>
                    <span className={styles.distanceText}>до Каабы</span>
                  </div>
                </div>

                <div className={styles.hotelGallery}>
                  <img src="/tour_1.png" alt="Fairmont Makkah" />
                  <img src="/tour_2.png" alt="Fairmont Makkah" />
                  <img src="/tour_3.png" alt="Fairmont Makkah" />
                  <img src="/tour_4.png" alt="Fairmont Makkah" />
                  <img src="/tour_1.png" alt="Fairmont Makkah" />
                  <img src="/tour_2.png" alt="Fairmont Makkah" />
                </div>

                <div className={styles.hotelDetails}>
                  <h3>Fairmont Makkah Clock Royal Tower</h3>
                  <p>Отель расположен в комплексе Abraj Al Bait с прямым доступом к Аль-Хараму. Впечатляющий вид на Каабу, просторные номера, высокий уровень сервиса и широкий выбор ресторанов. Идеально подходит для паломников, сочетая комфорт, расположение и международное качество.</p>
                  
                  <div className={styles.amenities}>
                    <h4>Удобства и размещения в номере</h4>
                    <ul>
                      <li><img src="/check-green.svg" alt="check" />Бесплатный Wi-Fi</li>
                      <li><img src="/check-green.svg" alt="check" />Номера с видом на Каабу</li>
                      <li><img src="/check-green.svg" alt="check" />Собственная ванная комната (халат, тапочки, туалетные принадлежности)</li>
                      <li><img src="/check-green.svg" alt="check" />Телевизор с плоским экраном и спутниковыми каналами</li>
                      <li><img src="/check-green.svg" alt="check" />Кондиционер</li>
                      <li><img src="/check-green.svg" alt="check" />Фитнес-центр</li>
                      <li><img src="/check-green.svg" alt="check" />2 ресторана на территории отеля</li>
                      <li><img src="/check-green.svg" alt="check" />Прямой доступ к Аль-Хараму</li>
                      <li><img src="/check-green.svg" alt="check" />Типы номеров: 1-, 2-, 3- и 4-местные</li>
                      <li><img src="/check-green.svg" alt="check" />Типы кроватей: одна большая или несколько односпальных на выбор</li>
                    </ul>
                  </div>
                  
                  <div className={styles.reviews}>
                    <h4>Отзывы гостей</h4>
                    <div className={styles.overallRating}>
                      <span className={styles.ratingScore}>9.3</span>
                      <span className={styles.ratingText}>Превосходно</span>
                    </div>
                    <div className={styles.ratingCategories}>
                      <div className={styles.ratingItem}>
                        <div className={styles.ratingHeader}>
                          <span>Персонал</span>
                          <span>9.6</span>
                        </div>
                        <div className={styles.ratingBar}>
                          <div className={styles.ratingBarFill} style={{width: '96%'}}></div>
                        </div>
                      </div>
                      <div className={styles.ratingItem}>
                        <div className={styles.ratingHeader}>
                          <span>Удобства</span>
                          <span>9.6</span>
                        </div>
                        <div className={styles.ratingBar}>
                          <div className={styles.ratingBarFill} style={{width: '96%'}}></div>
                        </div>
                      </div>
                      <div className={styles.ratingItem}>
                        <div className={styles.ratingHeader}>
                          <span>Чистота</span>
                          <span>9.6</span>
                        </div>
                        <div className={styles.ratingBar}>
                          <div className={styles.ratingBarFill} style={{width: '96%'}}></div>
                        </div>
                      </div>
                      <div className={styles.ratingItem}>
                        <div className={styles.ratingHeader}>
                          <span>Соотношение цена/качество</span>
                          <span>9.6</span>
                        </div>
                        <div className={styles.ratingBar}>
                          <div className={styles.ratingBarFill} style={{width: '96%'}}></div>
                        </div>
                      </div>
                      <div className={styles.ratingItem}>
                        <div className={styles.ratingHeader}>
                          <span>Расположение</span>
                          <span>9.6</span>
                        </div>
                        <div className={styles.ratingBar}>
                          <div className={styles.ratingBarFill} style={{width: '96%'}}></div>
                        </div>
                      </div>
                      <div className={styles.ratingItem}>
                        <div className={styles.ratingHeader}>
                          <span>Бесплатный Wi-Fi</span>
                          <span>9.6</span>
                        </div>
                        <div className={styles.ratingBar}>
                          <div className={styles.ratingBarFill} style={{width: '96%'}}></div>
                        </div>
                      </div>
                      <div className={styles.ratingItem}>
                        <div className={styles.ratingHeader}>
                          <span>Комфорт</span>
                          <span>9.6</span>
                        </div>
                        <div className={styles.ratingBar}>
                          <div className={styles.ratingBarFill} style={{width: '96%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.flightSection}>
                <div className={styles.flightSectionHeader}>
                  <h3>Проживание в Медине · <span className={styles.flightSectionTitle}>Waqf Al Safi</span></h3>
                  <img src="/medina.svg" alt="airplane" />
                </div>

                <div className={styles.hotelOverview}>
                  <div className={styles.hotelBrand}>
                   <img src="/waqf.svg" alt="airplane" />
                   
                  </div>
                  <div className={styles.hotelDistance}>
                    <span className={styles.distanceNumber}>200 м</span>
                    <span className={styles.distanceText}>до главной мечети</span>
                  </div>
                </div>

                <div className={styles.hotelGallery}>
                  <img src="/tour_3.png" alt="Waqf Al Safi" />
                  <img src="/tour_4.png" alt="Waqf Al Safi" />
                  <img src="/tour_1.png" alt="Waqf Al Safi" />
                  <img src="/tour_2.png" alt="Waqf Al Safi" />
                  <img src="/tour_3.png" alt="Waqf Al Safi" />
                  <img src="/tour_4.png" alt="Waqf Al Safi" />
                </div>

                <div className={styles.hotelDetails}>
                  <h3>Waqf Al Safi</h3>
                  <p>Отель расположен в комплексе Abraj Al Bait с прямым доступом к Аль-Хараму. Впечатляющий вид на Каабу, просторные номера, высокий уровень сервиса и широкий выбор ресторанов. Идеально подходит для паломников, сочетая комфорт, расположение и международное качество.</p>
                  
                  <div className={styles.amenities}>
                    <h4>Удобства и размещения в номере</h4>
                    <ul>
                      <li><img src="/check-green.svg" alt="check" />Бесплатный Wi-Fi</li>
                      <li><img src="/check-green.svg" alt="check" />Номера с видом на мечеть</li>
                      <li><img src="/check-green.svg" alt="check" />Собственная ванная комната (халат, тапочки, туалетные принадлежности)</li>
                      <li><img src="/check-green.svg" alt="check" />Телевизор с плоским экраном и спутниковыми каналами</li>
                      <li><img src="/check-green.svg" alt="check" />Кондиционер</li>
                      <li><img src="/check-green.svg" alt="check" />Фитнес-центр</li>
                      <li><img src="/check-green.svg" alt="check" />2 ресторана на территории отеля</li>
                      <li><img src="/check-green.svg" alt="check" />Прямой доступ к мечети</li>
                      <li><img src="/check-green.svg" alt="check" />Типы номеров: 1-, 2-, 3- и 4-местные</li>
                      <li><img src="/check-green.svg" alt="check" />Типы кроватей: одна большая или несколько односпальных на выбор</li>
                    </ul>
                  </div>
                  
                  <div className={styles.reviews}>
                    <h4>Отзывы гостей</h4>
                    <div className={styles.overallRating}>
                      <span className={styles.ratingScore}>9.3</span>
                      <span className={styles.ratingSeparator}>|</span>
                      <span className={styles.ratingText}>Превосходно</span>
                    </div>
                    <div className={styles.ratingCategories}>
                      <div className={styles.ratingItem}>
                        <div className={styles.ratingHeader}>
                          <span>Персонал</span>
                          <span>9.6</span>
                        </div>
                        <div className={styles.ratingBar}>
                          <div className={styles.ratingBarFill} style={{width: '96%'}}></div>
                        </div>
                      </div>
                      <div className={styles.ratingItem}>
                        <div className={styles.ratingHeader}>
                          <span>Удобства</span>
                          <span>9.6</span>
                        </div>
                        <div className={styles.ratingBar}>
                          <div className={styles.ratingBarFill} style={{width: '96%'}}></div>
                        </div>
                      </div>
                      <div className={styles.ratingItem}>
                        <div className={styles.ratingHeader}>
                          <span>Чистота</span>
                          <span>9.6</span>
                        </div>
                        <div className={styles.ratingBar}>
                          <div className={styles.ratingBarFill} style={{width: '96%'}}></div>
                        </div>
                      </div>
                      <div className={styles.ratingItem}>
                        <div className={styles.ratingHeader}>
                          <span>Соотношение цена/качество</span>
                          <span>9.6</span>
                        </div>
                        <div className={styles.ratingBar}>
                          <div className={styles.ratingBarFill} style={{width: '96%'}}></div>
                        </div>
                      </div>
                      <div className={styles.ratingItem}>
                        <div className={styles.ratingHeader}>
                          <span>Расположение</span>
                          <span>9.6</span>
                        </div>
                        <div className={styles.ratingBar}>
                          <div className={styles.ratingBarFill} style={{width: '96%'}}></div>
                        </div>
                      </div>
                      <div className={styles.ratingItem}>
                        <div className={styles.ratingHeader}>
                          <span>Бесплатный Wi-Fi</span>
                          <span>9.6</span>
                        </div>
                        <div className={styles.ratingBar}>
                          <div className={styles.ratingBarFill} style={{width: '96%'}}></div>
                        </div>
                      </div>
                      <div className={styles.ratingItem}>
                        <div className={styles.ratingHeader}>
                          <span>Комфорт</span>
                          <span>9.6</span>
                        </div>
                        <div className={styles.ratingBar}>
                          <div className={styles.ratingBarFill} style={{width: '96%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.flightInfo}>
            <div className={styles.flightHeader}>
              <div className={styles.flightTitle}>
                <img src="/icon_trans.svg" alt="bus" />
                <span>Трансфер</span>
              </div>
            </div>

            <div className={styles.flightSections}>
              <div className={styles.flightSection}>
                <div className={styles.flightSectionHeader}>
                  <h3>В городе</h3>
                  <img src="/city.svg" alt="city" />
                </div>

                <div className={styles.transferImage}>
                  <img src="/trans_1.png" alt="QAID Bus" />
                </div>

                <div className={styles.transferContent}>
                  <h4>Трансферы на автобусе QAID</h4>
                  <p>Автобусы QAID — надежные и комфортабельные транспортные средства с профессиональными водителями, обеспечивающие удобство и безопасность при поездках к святым местам.</p>
                  <p>Автобусы QAID предоставляют услуги трансфера в городе, включая встречу в аэропорту, трансферы между отелями, экскурсии и поездки между святыми местами. Просторные салоны, кондиционирование воздуха и организованное сопровождение обеспечивают комфортное и спокойное путешествие.</p>
                </div>
              </div>

              <div className={styles.flightSection}>
                <div className={styles.flightSectionHeader}>
                  <h3>Межгород</h3>
                  <img src="/map.svg" alt="train" />
                </div>

                <div className={styles.transferImage}>
                  <img src="/trans_2.png" alt="Haramain High Speed Train" />
                </div>

                <div className={styles.transferContent}>
                  <h4>Haramain High Speed Train</h4>
                  <p>Haramain High Speed Train — современный высокоскоростной поезд, соединяющий Мекку и Медину. Надежность, скорость и комфорт делают его идеальным выбором для путешествий между святыми городами.</p>
                  <p>Билеты на Haramain High Speed Train доступны для поездок между Мединой и Меккой. Просторные вагоны, плавная езда и точное расписание позволяют совершить путешествие всего за 2 часа с максимальным комфортом, безопасностью и пунктуальностью.</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.flightInfo}>
            <div className={styles.flightHeader}>
              <div className={styles.flightTitle}>
                <img src="/hadj.svg" alt="hajj" />
                <span>Хадж набор</span>
              </div>
            </div>

            <div className={styles.flightSections}>
              <div className={styles.flightSection}>
                <div className={styles.flightSectionHeader}>
                  <h3>Для мужчин</h3>
                  <img src="/man.svg" alt="man" />
                </div>

                <div className={styles.hajjGallery}>
                  <img src="/man_1.png" alt="Men's Hajj Kit" />
                  <img src="/man_2.png" alt="Men's Hajj Kit" />
                  <img src="/man_3.png" alt="Men's Hajj Kit" />
                </div>

                <div className={styles.transferContent}>
                  <h4>Atlas Collection</h4>
                  <p>Atlas Collection — полный набор для хаджа и умры, включающий удобную одежду, компактные сумки, рюкзаки, путеводители, дуа и мелкие принадлежности, такие как тапочки, мешочки для обуви и маски. Все разработано для уверенного, организованного и спокойного путешествия.</p>
                  
                  <div className={styles.amenities}>
                    <h4>Что входит в набор</h4>
                    <ul>
                      <li><img src="/check-green.svg" alt="check" />Одежда для мужчин: футболка, штаны, кепка, рюкзак</li>
                      <li><img src="/check-green.svg" alt="check" />Сборник дуа: на арабском и родном языке</li>
                      <li><img src="/check-green.svg" alt="check" />Путеводитель по обрядам: пошаговые инструкции хаджа и умры</li>
                      <li><img src="/check-green.svg" alt="check" />Фирменная сумка Atlas Collection</li>
                      <li><img src="/check-green.svg" alt="check" />Маска и наволочка</li>
                      <li><img src="/check-green.svg" alt="check" />Тапочки для обрядов</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className={styles.flightSection}>
                <div className={styles.flightSectionHeader}>
                  <h3>Для женщин</h3>
                  <img src="/woman.svg" alt="woman" />
                </div>

                <div className={styles.hajjGallery}>
                  <img src="/woman_1.png" alt="Women's Hajj Kit" />
                  <img src="/woman_2.png" alt="Women's Hajj Kit" />
                  <img src="/woman_3.png" alt="Women's Hajj Kit" />
                  <img src="/woman_4.png" alt="Women's Hajj Kit" />
                </div>

                <div className={styles.transferContent}>
                  <h4>Atlas Collection</h4>
                  <p>Atlas Collection — полный набор для хаджа и умры, включающий удобную одежду, компактные сумки, рюкзаки, путеводители, дуа и мелкие принадлежности, такие как тапочки, мешочки для обуви и маски. Все разработано для уверенного, организованного и спокойного путешествия.</p>
                  
                  <div className={styles.amenities}>
                    <h4>Что входит в набор</h4>
                    <ul>
                      <li><img src="/check-green.svg" alt="check" />Одежда для женщин: платье, абайя, хиджаб, рюкзак</li>
                      <li><img src="/check-green.svg" alt="check" />Сборник дуа: на арабском и родном языке</li>
                      <li><img src="/check-green.svg" alt="check" />Путеводитель по обрядам: пошаговые инструкции хаджа и умры</li>
                      <li><img src="/check-green.svg" alt="check" />Фирменная сумка Atlas Collection</li>
                      <li><img src="/check-green.svg" alt="check" />Маска и наволочка</li>
                      <li><img src="/check-green.svg" alt="check" />Тапочки для обрядов</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.flightInfo}>
            <div className={styles.flightHeader}>
              <div className={styles.flightTitle}>
                <img src="/check.svg" alt="shield" />
                <span>Что входит в пакет Fairmont Package</span>
              </div>
            </div>

            <div className={styles.packageGrid}>
              <div className={styles.packageCard}>
                <img src="/check-green.svg" alt="check" />
                <div className={styles.packageCardContent}>
                  <h4>Перелёт</h4>
                  <p>Авиабилеты туда и обратно включены в стоимость тура</p>
                </div>
              </div>

              <div className={styles.packageCard}>
                <img src="/check-green.svg" alt="check" />
                <div className={styles.packageCardContent}>
                  <h4>Отель</h4>
                  <p>Проживание в комфортных отелях в Мекке и Медине</p>
                </div>
              </div>

              <div className={styles.packageCard}>
                <img src="/check-green.svg" alt="check" />
                <div className={styles.packageCardContent}>
                  <h4>Питание</h4>
                  <p>Завтраки и ужины каждый день во время поездки</p>
                </div>
              </div>

              <div className={styles.packageCard}>
                <img src="/check-green.svg" alt="check" />
                <div className={styles.packageCardContent}>
                  <h4>Виза</h4>
                  <p>Годовая туристическая виза в Саудовскую Аравию</p>
                </div>
              </div>

              <div className={styles.packageCard}>
                <img src="/check-green.svg" alt="check" />
                <div className={styles.packageCardContent}>
                  <h4>Мед. страховка</h4>
                  <p>Полис, покрывающий здоровье и жизнь за границей</p>
                </div>
              </div>

              <div className={styles.packageCard}>
                <img src="/check-green.svg" alt="check" />
                <div className={styles.packageCardContent}>
                  <h4>Гид</h4>
                  <p>Сопровождение опытного гида на всём маршруте</p>
                </div>
              </div>

              <div className={styles.packageCard}>
                <img src="/check-green.svg" alt="check" />
                <div className={styles.packageCardContent}>
                  <h4>Трансфер</h4>
                  <p>Комфортабельный автобус по городам и между ними</p>
                </div>
              </div>

              <div className={styles.packageCard}>
                <img src="/check-green.svg" alt="check" />
                <div className={styles.packageCardContent}>
                  <h4>Скоростной поезд</h4>
                  <p>Билеты между Меккой и Мединой включены</p>
                </div>
              </div>

              <div className={styles.packageCard}>
                <img src="/check-green.svg" alt="check" />
                <div className={styles.packageCardContent}>
                  <h4>Экскурсии</h4>
                  <p>Посещение святых мест в составе группы</p>
                </div>
              </div>

              <div className={styles.packageCard}>
                <img src="/check-green.svg" alt="check" />
                <div className={styles.packageCardContent}>
                  <h4>Подача документов</h4>
                  <p>Помощь в сборе и подаче всех необходимых бумаг</p>
                </div>
              </div>

              <div className={styles.packageCard}>
                <img src="/check-green.svg" alt="check" />
                <div className={styles.packageCardContent}>
                  <h4>Бронирование</h4>
                  <p>После оплаты вы получаете ваучеры и детали тура</p>
                </div>
              </div>

              <div className={styles.packageCard}>
                <img src="/check-green.svg" alt="check" />
                <div className={styles.packageCardContent}>
                  <h4>Поддержка</h4>
                  <p>Связь с нами через WhatsApp по всем вопросам</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.accommodationOptions}>
            <div className={styles.accommodationOptionsHeader}>
              <div className={styles.accommodationOptionsTitle}>
                <img src="/bad.svg" alt="bed" />
                <span>Варианты размещения</span>
              </div>
            </div>

            <div className={styles.roomOptionsGrid}>
              <div className={styles.roomCard}>
                <div className={styles.roomHeader}>
                  <div className={styles.roomIcons}>
                    <div className={styles.smallBeds}>
                      <img src="/room.svg" alt="bed" />
                      <img src="/room.svg" alt="bed" />
                      <img src="/room.svg" alt="bed" />
                      <img src="/room.svg" alt="bed" />
                    </div>
                  </div>
                  <h3>Четырехместный номер</h3>
                </div>

                <div className={styles.roomInfo}>
                  <div className={styles.roomSection}>
                    <img src="/human.svg" alt="person" />
                    <div className={styles.roomSectionContent}>
                      <h4>Проживание</h4>
                      <span>В номере с Вами будут размещены +3 человека</span>
                    </div>
                  </div>
                  <div className={styles.roomSection}>
                    <img src="/bad.svg" alt="bed" />
                    <div className={styles.roomSectionContent}>
                      <h4>Типы кровати</h4>
                      <span>4 односпальных кровати</span>
                    </div>
                  </div>
                </div>

                <div className={styles.availabilityInfo}>
                  <img src="/alert.svg" alt="alert" />
                  <span>Осталось 4 места</span>
                </div>

                <div className={styles.roomPrice}>
                  <p>Без скрытых платежей</p>
                  <div className={styles.priceInfo}>
                    <span className={styles.currentPrice}>$2 400</span>
                    <span className={styles.oldPrice}>От $2 500</span>
                  </div>
                  <p className={styles.additionalPrice}>~1312 500T</p>
                </div>

                <button className={styles.bookButton}>Перейти к бронированию</button>
                <p className={styles.roomDescription}>Оформите бронирование на себя и до 3-х спутников в одном номере.</p>
              </div>

              <div className={styles.roomCard}>
                <div className={styles.roomHeader}>
                  <div className={styles.roomIcons}>
       
                    <div className={styles.smallBeds}>
                      <img src="/room.svg" alt="bed" />
                      <img src="/room.svg" alt="bed" />
                      <img src="/room.svg" alt="bed" />
                    </div>
                  </div>
                  <h3>Трехместный номер</h3>
                </div>

                <div className={styles.roomInfo}>
                  <div className={styles.roomSection}>
                    <img src="/human.svg" alt="person" />
                    <div className={styles.roomSectionContent}>
                      <h4>Проживание</h4>
                      <span>В номере с Вами будут размещены +3 человека</span>
                    </div>
                  </div>
                  <div className={styles.roomSection}>
                    <img src="/bad.svg" alt="bed" />
                    <div className={styles.roomSectionContent}>
                      <h4>Типы кровати</h4>
                      <span>4 односпальных кровати</span>
                    </div>
                  </div>
                </div>

                <div className={styles.availabilityInfo}>
                  <img src="/alert.svg" alt="alert" />
                  <span>Осталось 4 места</span>
                </div>

                <div className={styles.roomPrice}>
                  <p>Без скрытых платежей</p>
                  <div className={styles.priceInfo}>
                    <span className={styles.currentPrice}>$2 400</span>
                    <span className={styles.oldPrice}>От $2 500</span>
                  </div>
                  <p className={styles.additionalPrice}>~1312 500T</p>
                </div>

                <button className={styles.bookButton}>Перейти к бронированию</button>
                <p className={styles.roomDescription}>Оформите бронирование на себя и до 3-х спутников в одном номере.</p>
              </div>

              <div className={styles.roomCard}>
                <div className={styles.roomHeader}>
                  <div className={styles.roomIcons}>
                    <div className={styles.smallBeds}>
                      <img src="/room.svg" alt="bed" />
                      <img src="/room.svg" alt="bed" />
                    </div>
                  </div>
                  <h3>Двухместный номер</h3>
                </div>

                <div className={styles.roomInfo}>
                  <div className={styles.roomSection}>
                    <img src="/human.svg" alt="person" />
                    <div className={styles.roomSectionContent}>
                      <h4>Проживание</h4>
                      <span>В номере с Вами будут размещены +1 человека</span>
                    </div>
                  </div>
                  <div className={styles.roomSection}>
                    <img src="/bad.svg" alt="bed" />
                    <div className={styles.roomSectionContent}>
                      <h4>Типы кровати</h4>
                      <span>4 односпальных или 1 большая кровать</span>
                    </div>
                  </div>
                </div>

                <div className={styles.availabilityInfo}>
                  <img src="/alert.svg" alt="alert" />
                  <span>Осталось 4 места</span>
                </div>

                <div className={styles.roomPrice}>
                  <p>Без скрытых платежей</p>
                  <div className={styles.priceInfo}>
                    <span className={styles.currentPrice}>$2 400</span>
                    <span className={styles.oldPrice}>От $2 500</span>
                  </div>
                  <p className={styles.additionalPrice}>~1312 500T</p>
                </div>

                <button className={styles.bookButton}>Перейти к бронированию</button>
                <p className={styles.roomDescription}>Оформите бронирование на себя и до 3-х спутников в одном номере.</p>
              </div>

              <div className={styles.roomCard}>
                <div className={styles.roomHeader}>
                  <div className={styles.roomIcons}>
                    <div className={styles.smallBeds}>
                      <img src="/room.svg" alt="bed" />
                    </div>
                  </div>
                  <h3>Одноместный номер</h3>
                </div>

                <div className={styles.roomInfo}>
                  <div className={styles.roomSection}>
                    <img src="/human.svg" alt="person" />
                    <div className={styles.roomSectionContent}>
                      <h4>Проживание</h4>
                      <span>В номере будете проживать только Вы</span>
                    </div>
                  </div>
                  <div className={styles.roomSection}>
                    <img src="/bad.svg" alt="bed" />
                    <div className={styles.roomSectionContent}>
                      <h4>Типы кровати</h4>
                      <span>1 большая кровать</span>
                    </div>
                  </div>
                </div>

                <div className={styles.availabilityInfo}>
                  <img src="/alert.svg" alt="alert" />
                  <span>Осталось 4 места</span>
                </div>

                <div className={styles.roomPrice}>
                  <p>Без скрытых платежей</p>
                  <div className={styles.priceInfo}>
                    <span className={styles.currentPrice}>$2 400</span>
                    <span className={styles.oldPrice}>От $2 500</span>
                  </div>
                  <p className={styles.additionalPrice}>~1312 500T</p>
                </div>

                <button className={styles.bookButton}>Перейти к бронированию</button>
                <p className={styles.roomDescription}>Оформите бронирование на себя и до 3-х спутников в одном номере.</p>
              </div>
            </div>
          </div>

          <div className={styles.pilgrimReviews}>
            <div className={styles.pilgrimReviewsHeader}>
              <div className={styles.pilgrimReviewsTitle}>
                <img src="/review.svg" alt="chat" />
                <span>Отзывы паломников</span>
              </div>
            </div>

            <div className={styles.reviewsGrid}>
              <div className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.userAvatar}>Н</div>
                  <div className={styles.userInfo}>
                    <h4>Нурали Копбосын</h4>
                  </div>
                  <div className={styles.rating}>9 из 10</div>
                </div>
                <p className={styles.reviewText}>Отель расположен в очень хорошем и удобном районе. В номере было чисто. Персонал очень дружелюбный и всегда готов помочь.</p>
                <p className={styles.reviewDate}>Дата отзыва: 19.07.2025</p>
              </div>

              <div className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.userAvatar}>Н</div>
                  <div className={styles.userInfo}>
                    <h4>Нурали Копбосын</h4>
                  </div>
                  <div className={styles.rating}>9 из 10</div>
                </div>
                <p className={styles.reviewText}>Отель расположен в очень хорошем и удобном районе. В номере было чисто.</p>
                <p className={styles.reviewDate}>Дата отзыва: 19.07.2025</p>
              </div>

              <div className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.userAvatar}>Н</div>
                  <div className={styles.userInfo}>
                    <h4>Нурали Копбосын</h4>
                  </div>
                  <div className={styles.rating}>9 из 10</div>
                </div>
                <p className={styles.reviewText}>Отель расположен в очень хорошем и удобном районе. В номере было чисто. еще какой-то доп текст бла бла бла</p>
                <p className={styles.reviewDate}>Дата отзыва: 19.07.2025</p>
              </div>

              <div className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.userAvatar}>Н</div>
                  <div className={styles.userInfo}>
                    <h4>Нурали Копбосын</h4>
                  </div>
                  <div className={styles.rating}>9 из 10</div>
                </div>
                <p className={styles.reviewText}>Отель расположен в очень хорошем и удобном районе. В номере было чисто.</p>
                <p className={styles.reviewDate}>Дата отзыва: 19.07.2025</p>
              </div>

              <div className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.userAvatar}>Н</div>
                  <div className={styles.userInfo}>
                    <h4>Нурали Копбосын</h4>
                  </div>
                  <div className={styles.rating}>9 из 10</div>
                </div>
                <p className={styles.reviewText}>Отель расположен в очень хорошем и удобном районе. В номере было чисто.</p>
                <p className={styles.reviewDate}>Дата отзыва: 19.07.2025</p>
              </div>
              <div className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.userAvatar}>Н</div>
                  <div className={styles.userInfo}>
                    <h4>Нурали Копбосын</h4>
                  </div>
                  <div className={styles.rating}>9 из 10</div>
                </div>
                <p className={styles.reviewText}>Отель расположен в очень хорошем и удобном районе. В номере было чисто.</p>
                <p className={styles.reviewDate}>Дата отзыва: 19.07.2025</p>
              </div>

              <div className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.userAvatar}>Н</div>
                  <div className={styles.userInfo}>
                    <h4>Нурали Копбосын</h4>
                  </div>
                  <div className={styles.rating}>9 из 10</div>
                </div>
                <p className={styles.reviewText}>Отель расположен в очень хорошем и удобном районе. В номере было чисто.</p>
                <p className={styles.reviewDate}>Дата отзыва: 19.07.2025</p>
              </div>

              <div className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.userAvatar}>Н</div>
                  <div className={styles.userInfo}>
                    <h4>Нурали Копбосын</h4>
                  </div>
                  <div className={styles.rating}>9 из 10</div>
                </div>
                <p className={styles.reviewText}>Отель расположен в очень хорошем и удобном районе. В номере было чисто.</p>
                <p className={styles.reviewDate}>Дата отзыва: 19.07.2025</p>
              </div>
            </div>
          </div>

    

        
        </div>
      </main>

      <Footer />
    </div>
  );
}
