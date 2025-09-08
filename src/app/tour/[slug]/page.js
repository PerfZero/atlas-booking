"use client";
import { notFound } from "next/navigation";
import { useState, use, useEffect } from "react";
import { getTourBySlug } from "../../../lib/wordpress-api";
import { useAuth } from "../../../contexts/AuthContext";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SearchForm from "../../components/SearchForm";
import Breadcrumbs from "../../components/Breadcrumbs";
import BottomNavigation from "../../components/BottomNavigation";
import styles from "./page.module.css";

export default function TourDetailPage({ params }) {
  const [showNotification, setShowNotification] = useState(false);
  const [showBookingButton, setShowBookingButton] = useState(false);
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const resolvedParams = use(params);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const loadTour = async () => {
      try {
        setLoading(true);
        const tourData = await getTourBySlug(resolvedParams.slug);
        setTour(tourData);
      } catch (err) {
        console.error('Ошибка загрузки тура:', err);
        setError('Тур не найден');
      } finally {
        setLoading(false);
      }
    };

    loadTour();
    }, [resolvedParams.slug]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowBookingButton(scrollPosition > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className={styles.page}>
        <Header invertLogo={true} buttonStyle="search" />
        <main className={styles.main}>
          <div className={styles.container}>
            <div className={styles.loading}>Загрузка тура...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !tour) {
    return notFound();
  }

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

  const handleBooking = () => {
    if (isAuthenticated) {
      // Пользователь авторизован - переходим на страницу бронирования
      const tourData = {
        id: tour.id,
        name: tour.name,
        price: tour.price,
        priceValue: tour.price,
        oldPrice: tour.old_price,
        duration: tour.duration,
        departure: tour.departure_city,
        date: tour.tour_start_date,
        endDate: tour.tour_end_date,
        type: tour.pilgrimage_type,
        image: tour.featured_image,
        rating: tour.rating,
        reviews: tour.reviews_count,
        features: tour.features,
        slug: tour.slug,
        flightOutboundTime: tour.flight_outbound?.departure_time || '',
        flightInboundTime: tour.flight_inbound?.departure_time || '',
        flightOutboundDate: tour.tour_start_date,
        flightInboundDate: tour.tour_end_date
      };
      
      const queryString = new URLSearchParams(tourData).toString();
      window.location.href = `/booking?${queryString}`;
    } else {
      // Пользователь не авторизован - переходим на страницу авторизации с данными тура
      const tourData = {
        id: tour.id,
        name: tour.name,
        price: tour.price,
        priceValue: tour.price,
        oldPrice: tour.old_price,
        duration: tour.duration,
        departure: tour.departure_city,
        date: tour.tour_start_date,
        endDate: tour.tour_end_date,
        type: tour.pilgrimage_type,
        image: tour.featured_image,
        rating: tour.rating,
        reviews: tour.reviews_count,
        features: tour.features,
        slug: tour.slug,
        flightOutboundTime: tour.flight_outbound?.departure_time || '',
        flightInboundTime: tour.flight_inbound?.departure_time || '',
        flightOutboundDate: tour.tour_start_date,
        flightInboundDate: tour.tour_end_date
      };
      
      const queryString = new URLSearchParams(tourData).toString();
      const encoded = encodeURIComponent(queryString);
      window.location.href = `/auth?booking=${encoded}`;
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
              <SearchForm 
                searchParams={new URLSearchParams({
                  departureCity: tour.departure_city || 'almaty',
                  travelDate: 'custom',
                  pilgrimageType: tour.pilgrimage_type || 'umrah',
                  startDate: tour.tour_start_date || '2025-10-01',
                  endDate: tour.tour_end_date || '2025-10-07'
                })}
              />
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
                <img src={tour.featured_image || "/tour_1.png"} alt={tour.name} />
              </div>
              <div className={styles.sideImages}>
                {Array.isArray(tour.gallery) && tour.gallery.slice(0, 4).map((image, index) => (
                  <div key={index} className={styles.sideImage}>
                    <img src={image.url || image} alt={`${tour.name} ${index + 1}`} />
                  </div>
                ))}
                {(!Array.isArray(tour.gallery) || tour.gallery.length < 4) && (
                  <div className={styles.sideImage}>
                    <img src="/tour_1.png" alt="Вид на мечеть" />
                    <button className={styles.viewAllPhotos}>
                      <img src="/photos.svg" alt="eye" />
                      Посмотреть все фото
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.tourFeatures}>
            {Array.isArray(tour.features) && tour.features.map((feature, index) => (
              <div key={index} className={styles.featureItem}>
                <img src="/done.svg" alt="check" />
                <span>{typeof feature === 'object' && feature.feature_text ? feature.feature_text : feature}</span>
              </div>
            ))}
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
              <span className={styles.statNumber}>{tour.reviews_count || 382}</span>
              <div className={styles.statText}>
                <span>Паломников выбрали</span>
                <span>{tour.name}</span>
              </div>
            </div>

            <span className={styles.statSeparator}>|</span>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{tour.reviews_count || 291}</span>
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

                {tour.flight_outbound && (
                  <>
                    <div className={styles.airlineInfo}>
                      <div className={styles.airlineTag}>
                        <img src="/air_astana.svg" alt="airplane" />
                      </div>
                      <div className={styles.flightNumber}>
                        <span>{tour.flight_outbound.number}</span>
                      </div>
                    </div>

                    <div className={styles.routeInfo}>
                      <div className={styles.airport}>
                        <span className={styles.city}>{tour.flight_outbound.departure_airport}</span>
                        <span className={styles.code}>{tour.flight_outbound.departure_airport}</span>
                      </div>
                      <div className={styles.flightPath}>
                        <img src="/flight.svg" alt="flight" />
                      </div>
                      <div className={styles.airport}>
                        <span className={styles.city}>{tour.flight_outbound.arrival_airport}</span>
                        <span className={styles.code}>{tour.flight_outbound.arrival_airport}</span>
                      </div>
                    </div>

                    <div className={styles.duration}>
                      <span>Время в пути {tour.flight_outbound.duration}</span>
                    </div>

                    <div className={styles.timeInfo}>
                      <div className={styles.departure}>
                        <span>Вылет</span>
                        <span className={styles.time}>{tour.flight_outbound.departure_time}</span>
                        <span className={styles.date}>Пн, 19 июня</span>
                      </div>
                      <div className={styles.arrival}>
                        <span>Прилет</span>
                        <span className={styles.time}>{tour.flight_outbound.arrival_time}</span>
                        <span className={styles.date}>Вт, 19 июня</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className={styles.flightSection}>
                <div className={styles.flightSectionHeader}>
                  <h3>Обратно</h3>
                  <img src="/finish_fly.svg" alt="airplane" />
                </div>

                {tour.flight_inbound && (
                  <>
                    <div className={styles.airlineInfo}>
                      <div className={styles.airlineTag}>
                        <img src="/air_astana.svg" alt="airplane" />
                      </div>
                      <div className={styles.flightNumber}>
                        <span>{tour.flight_inbound.number}</span>
                      </div>
                    </div>

                    <div className={styles.routeInfo}>
                      <div className={styles.airport}>
                        <span className={styles.city}>{tour.flight_inbound.departure_airport}</span>
                        <span className={styles.code}>{tour.flight_inbound.departure_airport}</span>
                      </div>
                      <div className={styles.flightPath}>
                        <img src="/flight.svg" alt="flight" />
                      </div>
                      <div className={styles.airport}>
                        <span className={styles.city}>{tour.flight_inbound.arrival_airport}</span>
                        <span className={styles.code}>{tour.flight_inbound.arrival_airport}</span>
                      </div>
                    </div>

                    <div className={styles.duration}>
                      <span>Время в пути {tour.flight_inbound.duration}</span>
                    </div>

                    <div className={styles.timeInfo}>
                      <div className={styles.departure}>
                        <span>Вылет</span>
                        <span className={styles.time}>{tour.flight_inbound.departure_time}</span>
                        <span className={styles.date}>Пн, 19 июня</span>
                      </div>
                      <div className={styles.arrival}>
                        <span>Прилет</span>
                        <span className={styles.time}>{tour.flight_inbound.arrival_time}</span>
                        <span className={styles.date}>Вт, 19 июня</span>
                      </div>
                    </div>
                  </>
                )}
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
                  <h3>Проживание в Мекке · <span className={styles.flightSectionTitle}>{tour.hotel_mekka}</span></h3>
                  <img src="/mekka.svg" alt="airplane" />
                </div>

                <div className={styles.hotelOverview}>
                  <div className={styles.hotelBrand}>
                   <img src="/fairmont.svg" alt="airplane" />
                  </div>
                  <div className={styles.hotelDistance}>
                    <span className={styles.distanceNumber}>{tour.distance_mekka}</span>
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
                  <h3>{tour.hotel_mekka}</h3>
                  <p>{tour.hotel_mekka_details && tour.hotel_mekka_details.description ? tour.hotel_mekka_details.description : 'Отель расположен в комплексе Abraj Al Bait с прямым доступом к Аль-Хараму. Впечатляющий вид на Каабу, просторные номера, высокий уровень сервиса и широкий выбор ресторанов. Идеально подходит для паломников, сочетая комфорт, расположение и международное качество.'}</p>
                  
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
                        <span className={styles.ratingScore}>{tour.hotel_mekka_details && tour.hotel_mekka_details.rating ? tour.hotel_mekka_details.rating : '9.3'}</span>
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
                  <h3>Проживание в Медине · <span className={styles.flightSectionTitle}>{tour.hotel_medina}</span></h3>
                  <img src="/medina.svg" alt="airplane" />
                </div>

                <div className={styles.hotelOverview}>
                  <div className={styles.hotelBrand}>
                   <img src="/waqf.svg" alt="airplane" />
                   
                  </div>
                  <div className={styles.hotelDistance}>
                    <span className={styles.distanceNumber}>{tour.distance_medina}</span>
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
                  <h3>{tour.hotel_medina}</h3>
                  <p>{tour.hotel_medina_details && tour.hotel_medina_details.description ? tour.hotel_medina_details.description : 'Отель расположен в комплексе Abraj Al Bait с прямым доступом к Аль-Хараму. Впечатляющий вид на Каабу, просторные номера, высокий уровень сервиса и широкий выбор ресторанов. Идеально подходит для паломников, сочетая комфорт, расположение и международное качество.'}</p>
                  
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
                        <span className={styles.ratingScore}>{tour.hotel_medina_details && tour.hotel_medina_details.rating ? tour.hotel_medina_details.rating : '9.3'}</span>
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
                <span>Что входит в пакет {tour.name}</span>
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
              {Array.isArray(tour.room_options) && tour.room_options.map((room, index) => (
                <div key={index} className={styles.roomCard}>
                  <div className={styles.roomHeader}>
                    <div className={styles.roomIcons}>
                      <div className={styles.smallBeds}>
                        <img src="/room.svg" alt="bed" />
                        <img src="/room.svg" alt="bed" />
                        <img src="/room.svg" alt="bed" />
                        <img src="/room.svg" alt="bed" />
                      </div>
                    </div>
                    <h3>{room.type}</h3>
                  </div>

                  <div className={styles.roomInfo}>
                    <div className={styles.roomSection}>
                      <img src="/human.svg" alt="person" />
                      <div className={styles.roomSectionContent}>
                        <h4>Проживание</h4>
                        <span>{room.description}</span>
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
                    <span>Осталось {room.spots_left} мест</span>
                  </div>

                  <div className={styles.roomPrice}>
                    <p>Без скрытых платежей</p>
                    <div className={styles.priceInfo}>
                      <span className={styles.currentPrice}>${room.price}</span>
                      {room.old_price && <span className={styles.oldPrice}>От ${room.old_price}</span>}
                    </div>
                    <p className={styles.additionalPrice}>~{Math.round(room.price * 547)}T</p>
                  </div>

                  <button className={styles.bookButton} onClick={handleBooking}>Перейти к бронированию</button>
                  <p className={styles.roomDescription}>Оформите бронирование на себя и до 3-х спутников в одном номере.</p>
                </div>
              ))}


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

          <div className={`${styles.fixedBookingButton} ${!showBookingButton ? styles.hidden : ''}`}>
            <div className={styles.fixedBookingButtonContent}>
              <button className={styles.fixedBookButton} onClick={handleBooking}>
                Перейти к бронированию
              </button>
            </div>
          </div>

        </div>
      </main>

      <Footer />
      <BottomNavigation />
    </div>
  );
}