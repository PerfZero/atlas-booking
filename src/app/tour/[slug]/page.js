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
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import styles from "./page.module.css";

export default function TourDetailPage({ params }) {
  const [showNotification, setShowNotification] = useState(false);
  const [showBookingButton, setShowBookingButton] = useState(false);
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const resolvedParams = use(params);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const loadTour = async () => {
      try {
        setLoading(true);
        const tourData = await getTourBySlug(resolvedParams.slug);
        setTour(tourData);
      } catch (err) {
        console.error("Ошибка загрузки тура:", err);
        setError("Тур не найден");
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

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Обработка якоря при загрузке страницы
    const handleHashScroll = () => {
      if (window.location.hash === "#accommodation-options") {
        setTimeout(() => {
          const accommodationSection = document.getElementById(
            "accommodation-options"
          );
          if (accommodationSection) {
            accommodationSection.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    };

    // Проверяем якорь сразу и после загрузки
    handleHashScroll();
    window.addEventListener("hashchange", handleHashScroll);

    return () => window.removeEventListener("hashchange", handleHashScroll);
  }, [tour]);

  if (loading) {
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
                <SearchForm isHomePage={true} />
              </div>
            </div>
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
    // Прокручиваем к секции с вариантами размещения
    const accommodationSection = document.getElementById(
      "accommodation-options"
    );
    if (accommodationSection) {
      accommodationSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleRoomBooking = (roomData) => {
    if (isAuthenticated) {
      // Пользователь авторизован - переходим на страницу бронирования
      const tourData = {
        id: tour.id,
        name: tour.name,
        price: roomData.price || tour.price,
        priceValue: roomData.price || tour.price,
        oldPrice: roomData.old_price || tour.old_price,
        duration: tour.duration,
        departure: tour.departure_city,
        date:
          tour.tour_dates && tour.tour_dates.length > 0
            ? tour.tour_dates[0].date_start
            : null,
        endDate:
          tour.tour_dates && tour.tour_dates.length > 0
            ? tour.tour_dates[0].date_end
            : null,
        type: tour.pilgrimage_type,
        image: tour.featured_image,
        rating: tour.rating,
        reviews: tour.reviews_count,
        features: tour.features,
        slug: tour.slug,
        flightOutboundTime: tour.flight_outbound?.departure_time || "",
        flightInboundTime: tour.flight_inbound?.departure_time || "",
        flightOutboundDate:
          tour.tour_dates && tour.tour_dates.length > 0
            ? tour.tour_dates[0].date_start
            : null,
        flightInboundDate:
          tour.tour_dates && tour.tour_dates.length > 0
            ? tour.tour_dates[0].date_end
            : null,
        roomType: roomData.type || "double",
        roomCapacity: roomData.type === "single" ? 1 : 
                     roomData.type === "double" ? 2 : 
                     roomData.type === "triple" ? 3 : 
                     roomData.type === "quadruple" ? 4 : 2,
        roomDescription: roomData.description || 
          (roomData.type === "single" ? "Одноместное размещение" :
           roomData.type === "double" ? "В номере с Вами будут размещены +1 человек" :
           roomData.type === "triple" ? "В номере с Вами будут размещены +2 человека" :
           roomData.type === "quadruple" ? "В номере с Вами будут размещены +3 человека" :
           "В номере с Вами будут размещены +1 человек"),
        hotelMekka: tour.hotel_mekka_short_name || tour.hotel_mekka?.title || "Отель в Мекке",
        hotelMedina: tour.hotel_medina_short_name || tour.hotel_medina?.title || "Отель в Медине",
        transferNames: tour.transfers?.map(transfer => transfer.name || transfer.title).join(', ') || "Комфортабельный автобус и высокоскоростной поезд",
        flightName: tour.flight_outbound?.airline || "Air Astana",
        hajjKitNames: tour.hajj_kits?.map(kit => kit.name || kit.short_name).join(', ') || "Полный хадж набор",
        hajjKitTypes: tour.hajj_kits?.map(kit => kit.gender === 'male' ? 'Для мужчин' : kit.gender === 'female' ? 'Для женщин' : 'Унисекс').join(', ') || "Для мужчин и женщин",
      };

      const queryString = new URLSearchParams(tourData).toString();
      window.location.href = `/booking?${queryString}`;
    } else {
      // Пользователь не авторизован - переходим на страницу авторизации с данными тура
      const tourData = {
        id: tour.id,
        name: tour.name,
        price: roomData.price || tour.price,
        priceValue: roomData.price || tour.price,
        oldPrice: roomData.old_price || tour.old_price,
        duration: tour.duration,
        departure: tour.departure_city,
        date:
          tour.tour_dates && tour.tour_dates.length > 0
            ? tour.tour_dates[0].date_start
            : null,
        endDate:
          tour.tour_dates && tour.tour_dates.length > 0
            ? tour.tour_dates[0].date_end
            : null,
        type: tour.pilgrimage_type,
        image: tour.featured_image,
        rating: tour.rating,
        reviews: tour.reviews_count,
        features: tour.features,
        slug: tour.slug,
        flightOutboundTime: tour.flight_outbound?.departure_time || "",
        flightInboundTime: tour.flight_inbound?.departure_time || "",
        flightOutboundDate:
          tour.tour_dates && tour.tour_dates.length > 0
            ? tour.tour_dates[0].date_start
            : null,
        flightInboundDate:
          tour.tour_dates && tour.tour_dates.length > 0
            ? tour.tour_dates[0].date_end
            : null,
        roomType: roomData.type || "double",
        roomCapacity: roomData.type === "single" ? 1 : 
                     roomData.type === "double" ? 2 : 
                     roomData.type === "triple" ? 3 : 
                     roomData.type === "quadruple" ? 4 : 2,
        roomDescription: roomData.description || 
          (roomData.type === "single" ? "Одноместное размещение" :
           roomData.type === "double" ? "В номере с Вами будут размещены +1 человек" :
           roomData.type === "triple" ? "В номере с Вами будут размещены +2 человека" :
           roomData.type === "quadruple" ? "В номере с Вами будут размещены +3 человека" :
           "В номере с Вами будут размещены +1 человек"),
        hotelMekka: tour.hotel_mekka_short_name || tour.hotel_mekka?.title || "Отель в Мекке",
        hotelMedina: tour.hotel_medina_short_name || tour.hotel_medina?.title || "Отель в Медине",
        transferNames: tour.transfers?.map(transfer => transfer.name || transfer.title).join(', ') || "Комфортабельный автобус и высокоскоростной поезд",
        flightName: tour.flight_outbound?.airline || "Air Astana",
        hajjKitNames: tour.hajj_kits?.map(kit => kit.name || kit.short_name).join(', ') || "Полный хадж набор",
        hajjKitTypes: tour.hajj_kits?.map(kit => kit.gender === 'male' ? 'Для мужчин' : kit.gender === 'female' ? 'Для женщин' : 'Унисекс').join(', ') || "Для мужчин и женщин",
      };

      const queryString = new URLSearchParams(tourData).toString();
      const encoded = encodeURIComponent(queryString);
      window.location.href = `/auth?booking=${encoded}`;
    }
  };

  // Определяем хлебные крошки в зависимости от источника
  const getBreadcrumbItems = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromPopular = urlParams.get("from") === "popular";

    if (fromPopular) {
      // Пришли с популярных туров - показываем только главную
      return [{ label: "Главная", href: "/" }, { label: tour.name }];
    } else if (
      urlParams.has("startDate") ||
      urlParams.has("endDate") ||
      urlParams.has("departureCity") ||
      urlParams.has("pilgrimageType")
    ) {
      // Пришли из поиска (есть параметры поиска, но не с популярных)
      return [
        { label: "Главная", href: "/" },
        { label: "Результат поиска", href: "/search" },
        { label: tour.name },
      ];
    } else {
      // Прямой переход
      return [{ label: "Главная", href: "/" }, { label: tour.name }];
    }
  };

  const breadcrumbItems = getBreadcrumbItems();

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const getHajjKitImageIndex = (kitIndex, imageIndex) => {
    let baseIndex = 1; // Начинаем после главного изображения
    
    // Добавляем количество изображений из основной галереи
    if (Array.isArray(tour.gallery)) {
      baseIndex += tour.gallery.length;
    }
    
    // Добавляем количество изображений из предыдущих хадж наборов
    if (Array.isArray(tour.hajj_kits)) {
      for (let i = 0; i < kitIndex; i++) {
        if (Array.isArray(tour.hajj_kits[i].gallery)) {
          baseIndex += tour.hajj_kits[i].gallery.length;
        }
      }
    }
    
    return baseIndex + imageIndex;
  };

  // Функция для очистки HTML из текста
  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const getGalleryImages = () => {
    const images = [];

    // Всегда добавляем главное изображение первым
    images.push({
      src: tour.featured_image || "/tour_1.png",
      alt: tour.name,
    });

    // Добавляем изображения из галереи
    if (Array.isArray(tour.gallery)) {
      tour.gallery.forEach((image, index) => {
        images.push({
          src: image.url || image,
          alt: `${tour.name} ${index + 1}`,
        });
      });
    }

    // Добавляем изображения из хадж наборов
    if (Array.isArray(tour.hajj_kits)) {
      tour.hajj_kits.forEach((kit) => {
        if (Array.isArray(kit.gallery)) {
          kit.gallery.forEach((image, index) => {
            images.push({
              src: image.url,
              alt: `${kit.name} ${index + 1}`,
            });
          });
        }
      });
    }

    return images;
  };

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
              <SearchForm isHomePage={true} />
            </div>
          </div>
          <div className={styles.wrap}>
            <Breadcrumbs items={breadcrumbItems} />
          </div>

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
              <div className={styles.mainImage} onClick={() => openLightbox(0)}>
                <img
                  src={tour.featured_image || "/tour_1.png"}
                  alt={tour.name}
                />
              </div>
              <div className={styles.sideImages}>
                {Array.isArray(tour.gallery) &&
                  tour.gallery.slice(0, 4).map((image, index) => (
                    <div
                      key={index}
                      className={styles.sideImage}
                      onClick={() => openLightbox(index + 1)}
                    >
                      <img
                        src={image.url || image}
                        alt={`${tour.name} ${index + 1}`}
                      />
                    </div>
                  ))}
                {(!Array.isArray(tour.gallery) || tour.gallery.length < 4) && (
                  <div
                    className={styles.sideImage}
                    onClick={() => openLightbox(0)}
                  >
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
            {Array.isArray(tour.features) &&
              tour.features.map((feature, index) => (
                <div key={index} className={styles.featureItem}>
                  <img src="/done.svg" alt="check" />
                  <span>
                    {typeof feature === "object" && feature.feature_text
                      ? feature.feature_text
                      : feature}
                  </span>
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
              <span className={styles.statNumber}>
                {tour.reviews_count || 382}
              </span>
              <div className={styles.statText}>
                <span>Паломников выбрали</span>
                <span>{tour.name}</span>
              </div>
            </div>

            <span className={styles.statSeparator}>|</span>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>
                {tour.reviews_count || 291}
              </span>
              <div className={styles.statText}>
                <span>Отзывы паломников</span>
                <a href="#pilgrim-reviews" className={styles.statLink}>
                  Посмотреть
                </a>
              </div>
            </div>
          </div>

          {/* Секция рейсов */}
          {tour.flight_type && (
            <div className={styles.flightInfo}>
              <div className={styles.flightHeader}>
                <div className={styles.flightTitle}>
                  <img src="/airplane.svg" alt="airplane" />
                  <span>Данные о перелете</span>
                </div>
                <div className={styles.flightType}>
                  <span>{tour.flight_type === 'direct' ? 'Прямой рейс' : 'Рейс с пересадкой'}</span>
                </div>
              </div>

              <div className={styles.flightSections}>
                {/* Прямые рейсы */}
                {tour.flight_type === 'direct' && (
                  <>
                    {/* Рейс туда */}
                    {tour.flight_outbound && (
                      <div className={styles.flightSection}>
                        <div className={styles.flightSectionHeader}>
                          <h3>Туда</h3>
                          <img src="/start_fly.svg" alt="airplane" />
                        </div>

                        <div className={styles.airlineInfo}>
                          <div className={styles.airlineTag}>
                            {tour.flight_outbound.airline_logo?.url ? (
                              <img src={tour.flight_outbound.airline_logo.url} alt="airline" />
                            ) : (
                              <img src="/air_astana.svg" alt="airplane" />
                            )}
                          </div>
                          <div className={styles.flightNumber}>
                            <span>{tour.flight_outbound.number}</span>
                          </div>
                        </div>

                        <div className={styles.routeInfo}>
                          <div className={styles.airport}>
                            <span className={styles.city}>
                              {tour.flight_outbound.departure_city}
                            </span>
                            <span className={styles.code}>
                              {tour.flight_outbound.departure_airport}
                            </span>
                          </div>
                          <div className={styles.flightPath}>
                            <img src="/flight.svg" alt="flight" />
                          </div>
                          <div className={styles.airport}>
                            <span className={styles.city}>
                              Медина
                            </span>
                            <span className={styles.code}>
                              {tour.flight_outbound.arrival_airport}
                            </span>
                          </div>
                        </div>

                        <div className={styles.duration}>
                          <span>Время в пути {tour.flight_outbound.duration}</span>
                        </div>

                        <div className={styles.timeInfo}>
                          <div className={styles.departure}>
                            <span>Вылет</span>
                            <span className={styles.time}>
                              {tour.flight_outbound.departure_time}
                            </span>
                            <span className={styles.date}>{tour.flight_outbound.departure_date}</span>
                          </div>
                          <div className={styles.arrival}>
                            <span>Прилет</span>
                            <span className={styles.time}>
                              {tour.flight_outbound.arrival_time}
                            </span>
                            <span className={styles.date}>{tour.flight_outbound.arrival_date}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Рейс обратно */}
                    {tour.flight_inbound && (
                      <div className={styles.flightSection}>
                        <div className={styles.flightSectionHeader}>
                          <h3>Обратно</h3>
                          <img src="/finish_fly.svg" alt="airplane" />
                        </div>

                        <div className={styles.airlineInfo}>
                          <div className={styles.airlineTag}>
                            {tour.flight_inbound.airline_logo?.url ? (
                              <img src={tour.flight_inbound.airline_logo.url} alt="airline" />
                            ) : (
                              <img src="/air_astana.svg" alt="airplane" />
                            )}
                          </div>
                          <div className={styles.flightNumber}>
                            <span>{tour.flight_inbound.number}</span>
                          </div>
                        </div>

                        <div className={styles.routeInfo}>
                          <div className={styles.airport}>
                            <span className={styles.city}>
                              Медина
                            </span>
                            <span className={styles.code}>
                              {tour.flight_inbound.departure_airport}
                            </span>
                          </div>
                          <div className={styles.flightPath}>
                            <img src="/flight.svg" alt="flight" />
                          </div>
                          <div className={styles.airport}>
                            <span className={styles.city}>
                              {tour.flight_inbound.departure_city}
                            </span>
                            <span className={styles.code}>
                              {tour.flight_inbound.arrival_airport}
                            </span>
                          </div>
                        </div>

                        <div className={styles.duration}>
                          <span>Время в пути {tour.flight_inbound.duration}</span>
                        </div>

                        <div className={styles.timeInfo}>
                          <div className={styles.departure}>
                            <span>Вылет</span>
                            <span className={styles.time}>
                              {tour.flight_inbound.departure_time}
                            </span>
                            <span className={styles.date}>{tour.flight_inbound.departure_date}</span>
                          </div>
                          <div className={styles.arrival}>
                            <span>Прилет</span>
                            <span className={styles.time}>
                              {tour.flight_inbound.arrival_time}
                            </span>
                            <span className={styles.date}>{tour.flight_inbound.arrival_date}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Рейсы с пересадкой */}
                {tour.flight_type === 'connecting' && (
                  <>
                    {/* Рейс туда - Алматы → Кувейт */}
                    {tour.flight_outbound_connecting && (
                      <div className={styles.flightSection}>
                        <div className={styles.flightSectionHeader}>
                          <h3>Туда</h3>
                          <img src="/start_fly.svg" alt="airplane" />
                        </div>

                        <div className={styles.airlineInfo}>
                          <div className={styles.airlineTag}>
                            {tour.flight_outbound_connecting.airline_logo?.url ? (
                              <img src={tour.flight_outbound_connecting.airline_logo.url} alt="airline" />
                            ) : (
                              <img src="/air_astana.svg" alt="airplane" />
                            )}
                          </div>
                          <div className={styles.flightNumber}>
                            <span>{tour.flight_outbound_connecting.number}</span>
                          </div>
                        </div>

                        <div className={styles.routeInfo}>
                          <div className={styles.airport}>
                            <span className={styles.city}>
                              {tour.flight_outbound_connecting.departure_city}
                            </span>
                            <span className={styles.code}>
                              {tour.flight_outbound_connecting.departure_airport}
                            </span>
                          </div>
                          <div className={styles.flightPath}>
                            <img src="/flight.svg" alt="flight" />
                          </div>
                          <div className={styles.airport}>
                            <span className={styles.city}>
                              {tour.flight_outbound_connecting.connecting_airport || 'Kuwait'}
                            </span>
                            <span className={styles.code}>
                              {tour.flight_outbound_connecting.connecting_airport_code || 'KUW'}
                            </span>
                          </div>
                        </div>

                        <div className={styles.duration}>
                          <span>Время в пути {tour.flight_outbound_connecting.duration}</span>
                        </div>

                        <div className={styles.timeInfo}>
                          <div className={styles.departure}>
                            <span>Вылет</span>
                            <span className={styles.time}>
                              {tour.flight_outbound_connecting.departure_time}
                            </span>
                            <span className={styles.date}>{tour.flight_outbound_connecting.departure_date}</span>
                          </div>
                          <div className={styles.arrival}>
                            <span>Прилет</span>
                            <span className={styles.time}>
                              {tour.flight_outbound_connecting.arrival_time}
                            </span>
                            <span className={styles.date}>{tour.flight_outbound_connecting.arrival_date}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Пересадка в Кувейте */}
                    {tour.flight_connecting && (
                      <div className={`${styles.flightSection} ${styles.connectingSection}`}>
                        <div className={styles.flightSectionHeader}>
                          <h3>Пересадка</h3>
                          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.9458 29.6071C23.4191 29.6071 29.6065 23.4063 29.6065 15.9465C29.6065 8.47326 23.4057 2.28577 15.9325 2.28577C8.47265 2.28577 2.28516 8.47326 2.28516 15.9465C2.28516 23.4063 8.48605 29.6071 15.9458 29.6071ZM15.9458 27.3305C9.62445 27.3305 4.57534 22.2679 4.57534 15.9465C4.57534 9.62506 9.61105 4.56256 15.9325 4.56256C22.254 4.56256 27.3298 9.62506 27.3298 15.9465C27.3298 22.2679 22.2673 27.3305 15.9458 27.3305Z" fill="black"/>
<path d="M8.9414 17.393H15.9325C16.4548 17.393 16.87 16.9911 16.87 16.4554V7.42862C16.87 6.9063 16.4548 6.50452 15.9325 6.50452C15.4102 6.50452 15.0084 6.9063 15.0084 7.42862V15.5312H8.9414C8.40569 15.5312 8.00391 15.9331 8.00391 16.4554C8.00391 16.9911 8.40569 17.393 8.9414 17.393Z" fill="black"/>
</svg>
                        </div>

                        <div className={styles.airlineInfo}>
                          <div className={styles.airlineTag}>
                            <span>--</span>
                          </div>
                          <div className={styles.flightNumber}>
                            <span>--</span>
                          </div>
                        </div>

                        <div className={styles.connectingLocation}>
                          <div className={styles.connectingCity}>
                            {tour.flight_connecting.connecting_airport || 'Kuwait'}
                          </div>
                          <div className={styles.connectingCode}>
                            {tour.flight_connecting.connecting_airport_code || 'KUW'}
                          </div>
                        </div>

                        <div className={styles.duration}>
                          <span>Время ожидания: {tour.flight_connecting.connecting_wait_time || '--'}</span>
                        </div>

                        <div className={styles.timeInfo}>
                          <div className={styles.departure}>
                            <span>Вылет</span>
                            <span className={styles.time}>
                              --
                            </span>
                            <span className={styles.date}>--</span>
                          </div>
                          <div className={styles.arrival}>
                            <span>Прилет</span>
                            <span className={styles.time}>
                              --
                            </span>
                            <span className={styles.date}>--</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Рейс туда - Кувейт → Медина */}
                    {tour.flight_connecting && (
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
                            <span>{tour.flight_connecting.number || 'KC 911'}</span>
                          </div>
                        </div>

                        <div className={styles.routeInfo}>
                          <div className={styles.airport}>
                            <span className={styles.city}>
                              {tour.flight_connecting.connecting_airport || 'Kuwait'}
                            </span>
                            <span className={styles.code}>
                              {tour.flight_connecting.connecting_airport_code || 'KUW'}
                            </span>
                          </div>
                          <div className={styles.flightPath}>
                            <img src="/flight.svg" alt="flight" />
                          </div>
                          <div className={styles.airport}>
                            <span className={styles.city}>
                              Медина
                            </span>
                            <span className={styles.code}>
                              MED
                            </span>
                          </div>
                        </div>

                        <div className={styles.duration}>
                          <span>Время в пути {tour.flight_connecting.duration || '6 ч 20 м'}</span>
                        </div>

                        <div className={styles.timeInfo}>
                          <div className={styles.departure}>
                            <span>Вылет</span>
                            <span className={styles.time}>
                              {tour.flight_connecting.departure_time || '10:00'}
                            </span>
                            <span className={styles.date}>{tour.flight_connecting.departure_date || 'Пн, 19 июня'}</span>
                          </div>
                          <div className={styles.arrival}>
                            <span>Прилет</span>
                            <span className={styles.time}>
                              {tour.flight_connecting.arrival_time || '20:00'}
                            </span>
                            <span className={styles.date}>{tour.flight_connecting.arrival_date || 'Вт, 19 июня'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Рейс обратно - Медина → Кувейт */}
                    {tour.flight_inbound_connecting && (
                      <div className={styles.flightSection}>
                        <div className={styles.flightSectionHeader}>
                          <h3>Обратно</h3>
                          <img src="/finish_fly.svg" alt="airplane" />
                        </div>

                        <div className={styles.airlineInfo}>
                          <div className={styles.airlineTag}>
                            {tour.flight_inbound_connecting.airline_logo?.url ? (
                              <img src={tour.flight_inbound_connecting.airline_logo.url} alt="airline" />
                            ) : (
                              <img src="/air_astana.svg" alt="airplane" />
                            )}
                          </div>
                          <div className={styles.flightNumber}>
                            <span>{tour.flight_inbound_connecting.number}</span>
                          </div>
                        </div>

                        <div className={styles.routeInfo}>
                          <div className={styles.airport}>
                            <span className={styles.city}>
                              Медина
                            </span>
                            <span className={styles.code}>
                              MED
                            </span>
                          </div>
                          <div className={styles.flightPath}>
                            <img src="/flight.svg" alt="flight" />
                          </div>
                          <div className={styles.airport}>
                            <span className={styles.city}>
                              {tour.flight_inbound_connecting.connecting_airport || 'Kuwait'}
                            </span>
                            <span className={styles.code}>
                              {tour.flight_inbound_connecting.connecting_airport_code || 'KUW'}
                            </span>
                          </div>
                        </div>

                        <div className={styles.duration}>
                          <span>Время в пути {tour.flight_inbound_connecting.duration}</span>
                        </div>

                        <div className={styles.timeInfo}>
                          <div className={styles.departure}>
                            <span>Вылет</span>
                            <span className={styles.time}>
                              {tour.flight_inbound_connecting.departure_time}
                            </span>
                            <span className={styles.date}>{tour.flight_inbound_connecting.departure_date}</span>
                          </div>
                          <div className={styles.arrival}>
                            <span>Прилет</span>
                            <span className={styles.time}>
                              {tour.flight_inbound_connecting.arrival_time}
                            </span>
                            <span className={styles.date}>{tour.flight_inbound_connecting.arrival_date}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Пересадка в Кувейте (обратно) */}
                    {tour.flight_connecting && (
                      <div className={`${styles.flightSection} ${styles.connectingSection}`}>
                        <div className={styles.flightSectionHeader}>
                          <h3>Пересадка</h3>
                          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.9458 29.6071C23.4191 29.6071 29.6065 23.4063 29.6065 15.9465C29.6065 8.47326 23.4057 2.28577 15.9325 2.28577C8.47265 2.28577 2.28516 8.47326 2.28516 15.9465C2.28516 23.4063 8.48605 29.6071 15.9458 29.6071ZM15.9458 27.3305C9.62445 27.3305 4.57534 22.2679 4.57534 15.9465C4.57534 9.62506 9.61105 4.56256 15.9325 4.56256C22.254 4.56256 27.3298 9.62506 27.3298 15.9465C27.3298 22.2679 22.2673 27.3305 15.9458 27.3305Z" fill="black"/>
<path d="M8.9414 17.393H15.9325C16.4548 17.393 16.87 16.9911 16.87 16.4554V7.42862C16.87 6.9063 16.4548 6.50452 15.9325 6.50452C15.4102 6.50452 15.0084 6.9063 15.0084 7.42862V15.5312H8.9414C8.40569 15.5312 8.00391 15.9331 8.00391 16.4554C8.00391 16.9911 8.40569 17.393 8.9414 17.393Z" fill="black"/>
</svg>
                        </div>

                        <div className={styles.airlineInfo}>
                          <div className={styles.airlineTag}>
                            <span>--</span>
                          </div>
                          <div className={styles.flightNumber}>
                            <span>--</span>
                          </div>
                        </div>

                        <div className={styles.connectingLocation}>
                          <div className={styles.connectingCity}>
                            {tour.flight_connecting.connecting_airport || 'Kuwait'}
                          </div>
                          <div className={styles.connectingCode}>
                            {tour.flight_connecting.connecting_airport_code || 'KUW'}
                          </div>
                        </div>

                        <div className={styles.duration}>
                          <span>Время ожидания: {tour.flight_connecting.connecting_wait_time || '--'}</span>
                        </div>

                        <div className={styles.timeInfo}>
                          <div className={styles.departure}>
                            <span>Вылет</span>
                            <span className={styles.time}>
                              --
                            </span>
                            <span className={styles.date}>--</span>
                          </div>
                          <div className={styles.arrival}>
                            <span>Прилет</span>
                            <span className={styles.time}>
                              --
                            </span>
                            <span className={styles.date}>--</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Рейс обратно - Кувейт → Алматы */}
                    {tour.flight_inbound_connecting && (
                      <div className={styles.flightSection}>
                        <div className={styles.flightSectionHeader}>
                          <h3>Обратно</h3>
                          <img src="/finish_fly.svg" alt="airplane" />
                        </div>

                        <div className={styles.airlineInfo}>
                          <div className={styles.airlineTag}>
                            {tour.flight_inbound_connecting.airline_logo?.url ? (
                              <img src={tour.flight_inbound_connecting.airline_logo.url} alt="airline" />
                            ) : (
                              <img src="/air_astana.svg" alt="airplane" />
                            )}
                          </div>
                          <div className={styles.flightNumber}>
                            <span>{tour.flight_inbound_connecting.number}</span>
                          </div>
                        </div>

                        <div className={styles.routeInfo}>
                          <div className={styles.airport}>
                            <span className={styles.city}>
                              {tour.flight_inbound_connecting.connecting_airport || 'Kuwait'}
                            </span>
                            <span className={styles.code}>
                              {tour.flight_inbound_connecting.connecting_airport_code || 'KUW'}
                            </span>
                          </div>
                          <div className={styles.flightPath}>
                            <img src="/flight.svg" alt="flight" />
                          </div>
                          <div className={styles.airport}>
                            <span className={styles.city}>
                              {tour.flight_inbound_connecting.departure_city}
                            </span>
                            <span className={styles.code}>
                              {tour.flight_inbound_connecting.arrival_airport}
                            </span>
                          </div>
                        </div>

                        <div className={styles.duration}>
                          <span>Время в пути {tour.flight_inbound_connecting.duration}</span>
                        </div>

                        <div className={styles.timeInfo}>
                          <div className={styles.departure}>
                            <span>Вылет</span>
                            <span className={styles.time}>
                              {tour.flight_inbound_connecting.departure_time}
                            </span>
                            <span className={styles.date}>{tour.flight_inbound_connecting.departure_date}</span>
                          </div>
                          <div className={styles.arrival}>
                            <span>Прилет</span>
                            <span className={styles.time}>
                              {tour.flight_inbound_connecting.arrival_time}
                            </span>
                            <span className={styles.date}>{tour.flight_inbound_connecting.arrival_date}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {((tour.hotel_mekka && tour.hotel_mekka_details) ||
            (tour.hotel_medina && tour.hotel_medina_details)) && (
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
                {tour.hotel_mekka && tour.hotel_mekka_details && (
                  <div className={styles.flightSection}>
                    <div className={styles.flightSectionHeader}>
                      <h3>
                        {tour.hotel_mekka_accommodation_text || "Нет данных"} ·{" "}
                        <span className={styles.flightSectionTitle}>
                          {tour.hotel_mekka_short_name ||
                            tour.hotel_mekka?.title ||
                            "Нет данных"}
                        </span>
                      </h3>
                      <img src="/mekka.svg" alt="airplane" />
                    </div>

                    {(tour.hotel_mekka?.logo_image?.url || 
                      tour.hotel_mekka?.distance_number || 
                      tour.hotel_mekka?.distance_text) && (
                      <div className={styles.hotelOverview}>
                        <div className={styles.hotelBrand}>
                          {tour.hotel_mekka?.logo_image?.url && (
                            <img src={tour.hotel_mekka.logo_image.url} alt="hotel logo" />
                          )}
                        </div>
                        <div className={styles.hotelDistance}>
                          <span className={styles.distanceNumber}>
                            {tour.hotel_mekka?.distance_number}
                          </span>
                          <span className={styles.distanceText}>
                            {tour.hotel_mekka?.distance_text}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className={styles.hotelGallery}>
                      {Array.isArray(tour.hotel_mekka_details?.gallery) &&
                      tour.hotel_mekka_details.gallery.length > 0 &&
                      tour.hotel_mekka_details.gallery.map((image, index) => (
                        <img
                          key={index}
                          src={image.url}
                          alt={
                            tour.hotel_mekka_details.name || tour.hotel_mekka
                          }
                        />
                      ))}
                    </div>

                    {/* Детали проживания после фотографий */}
                    {console.log('Hotel Mekka details:', tour.hotel_mekka_details)}
                    {(tour.hotel_mekka_details?.check_in || tour.hotel_mekka_details?.check_out) && (
                      <div className={styles.hotelDates}>
                        <span>Заезд - Выезд: </span>
                        <span>
                          {new Date(tour.hotel_mekka_details.check_in).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long' })} - {new Date(tour.hotel_mekka_details.check_out).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long' })}
                        </span>
                      </div>
                    )}

                    <div className={styles.hotelDetails}>
                      <h3>
                        {tour.hotel_mekka_full_name ||
                          tour.hotel_mekka?.full_name ||
                          "Нет данных"}
                      </h3>
                      <p>
                        {tour.hotel_mekka_details?.description}
                      </p>

                      <div className={styles.amenities}>
                        <h4>Удобства и размещения в номере</h4>
                        {Array.isArray(tour.hotel_mekka_details?.amenities) &&
                        tour.hotel_mekka_details.amenities.length > 0 ? (
                          <ul>
                            {tour.hotel_mekka_details.amenities.map(
                              (amenity, index) => (
                                <li key={index}>
                                  <img src="/check-green.svg" alt="check" />
                                  {amenity.amenity_text}
                                </li>
                              )
                            )}
                          </ul>
                        ) : (
                          <p>Нет данных</p>
                        )}
                      </div>

                      <div className={styles.reviews}>
                        <h4>Отзывы гостей</h4>
                        {tour.hotel_mekka_details?.rating ||
                        tour.hotel_mekka_details?.rating_text ||
                        (Array.isArray(
                          tour.hotel_mekka_details?.rating_categories
                        ) &&
                          tour.hotel_mekka_details.rating_categories.length >
                            0) ? (
                          <>
                            <div className={styles.overallRating}>
                              <span className={styles.ratingScore}>
                                {tour.hotel_mekka_details?.rating}
                              </span>
                              <span className={styles.ratingText}>
                                {tour.hotel_mekka_details?.rating_text}
                              </span>
                            </div>
                            <div className={styles.ratingCategories}>
                              {Array.isArray(
                                tour.hotel_mekka_details?.rating_categories
                              ) &&
                                tour.hotel_mekka_details.rating_categories
                                  .length > 0 &&
                                tour.hotel_mekka_details.rating_categories.map(
                                  (category, index) => (
                                    <div
                                      key={index}
                                      className={styles.ratingItem}
                                    >
                                      <div className={styles.ratingHeader}>
                                        <span>{category.category_name}</span>
                                        <span>{category.category_score}</span>
                                      </div>
                                      <div className={styles.ratingBar}>
                                        <div
                                          className={styles.ratingBarFill}
                                          style={{
                                            width: `${
                                              parseFloat(
                                                category.category_score
                                              ) * 10
                                            }%`,
                                          }}
                                        ></div>
                                      </div>
                                    </div>
                                  )
                                )}
                            </div>
                          </>
                        ) : (
                          <p>Нет данных</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {tour.hotel_medina && tour.hotel_medina_details && (
                  <div className={styles.flightSection}>
                    <div className={styles.flightSectionHeader}>
                      <h3>
                        {tour.hotel_medina_accommodation_text || "Нет данных"} ·{" "}
                        <span className={styles.flightSectionTitle}>
                          {tour.hotel_medina_short_name ||
                            tour.hotel_medina?.title ||
                            "Нет данных"}
                        </span>
                      </h3>
                      <img src="/medina.svg" alt="airplane" />
                    </div>

                    {(tour.hotel_medina?.logo_image?.url || 
                      tour.hotel_medina?.distance_number || 
                      tour.hotel_medina?.distance_text) && (
                      <div className={styles.hotelOverview}>
                        <div className={styles.hotelBrand}>
                          {tour.hotel_medina?.logo_image?.url && (
                            <img src={tour.hotel_medina.logo_image.url} alt="hotel logo" />
                          )}
                        </div>
                        <div className={styles.hotelDistance}>
                          <span className={styles.distanceNumber}>
                            {tour.hotel_medina?.distance_number}
                          </span>
                          <span className={styles.distanceText}>
                            {tour.hotel_medina?.distance_text}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className={styles.hotelGallery}>
                      {Array.isArray(tour.hotel_medina_details?.gallery) &&
                      tour.hotel_medina_details.gallery.length > 0 &&
                      tour.hotel_medina_details.gallery.map(
                        (image, index) => (
                          <img
                            key={index}
                            src={image.url}
                            alt={
                              tour.hotel_medina_details.name ||
                              tour.hotel_medina
                            }
                          />
                        )
                      )}
                    </div>

                    {/* Детали проживания после фотографий */}
                    {(tour.hotel_medina_details?.check_in || tour.hotel_medina_details?.check_out) && (
                      <div className={styles.hotelDates}>
                        <span>Заезд - Выезд: </span>
                        <span>
                          {new Date(tour.hotel_medina_details.check_in).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long' })} - {new Date(tour.hotel_medina_details.check_out).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long' })}
                        </span>
                      </div>
                    )}

                    <div className={styles.hotelDetails}>
                      <h3>
                        {tour.hotel_medina_full_name ||
                          tour.hotel_medina?.full_name ||
                          "Нет данных"}
                      </h3>
                      <p>
                        {tour.hotel_medina_details?.description}
                      </p>

                      <div className={styles.amenities}>
                        <h4>Удобства и размещения в номере</h4>
                        {Array.isArray(tour.hotel_medina_details?.amenities) &&
                        tour.hotel_medina_details.amenities.length > 0 ? (
                          <ul>
                            {tour.hotel_medina_details.amenities.map(
                              (amenity, index) => (
                                <li key={index}>
                                  <img src="/check-green.svg" alt="check" />
                                  {amenity.amenity_text}
                                </li>
                              )
                            )}
                          </ul>
                        ) : (
                          <p>Нет данных</p>
                        )}
                      </div>

                      <div className={styles.reviews}>
                        <h4>Отзывы гостей</h4>
                        {tour.hotel_medina_details?.rating ||
                        tour.hotel_medina_details?.rating_text ||
                        (Array.isArray(
                          tour.hotel_medina_details?.rating_categories
                        ) &&
                          tour.hotel_medina_details.rating_categories.length >
                            0) ? (
                          <>
                            <div className={styles.overallRating}>
                              <span className={styles.ratingScore}>
                                {tour.hotel_medina_details?.rating}
                              </span>
                              <span className={styles.ratingSeparator}>|</span>
                              <span className={styles.ratingText}>
                                {tour.hotel_medina_details?.rating_text}
                              </span>
                            </div>
                            <div className={styles.ratingCategories}>
                              {Array.isArray(
                                tour.hotel_medina_details?.rating_categories
                              ) &&
                                tour.hotel_medina_details.rating_categories
                                  .length > 0 &&
                                tour.hotel_medina_details.rating_categories.map(
                                  (category, index) => (
                                    <div
                                      key={index}
                                      className={styles.ratingItem}
                                    >
                                      <div className={styles.ratingHeader}>
                                        <span>{category.category_name}</span>
                                        <span>{category.category_score}</span>
                                      </div>
                                      <div className={styles.ratingBar}>
                                        <div
                                          className={styles.ratingBarFill}
                                          style={{
                                            width: `${
                                              parseFloat(
                                                category.category_score
                                              ) * 10
                                            }%`,
                                          }}
                                        ></div>
                                      </div>
                                    </div>
                                  )
                                )}
                            </div>
                          </>
                        ) : (
                          <p>Нет данных</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {tour.transfers && tour.transfers.length > 0 && (
            <div className={styles.flightInfo}>
              <div className={styles.flightHeader}>
                <div className={styles.flightTitle}>
                  <img src="/icon_trans.svg" alt="bus" />
                  <span>Трансфер</span>
                </div>
              </div>

              <div className={styles.flightSections}>
                {tour.transfers.map((transfer, index) => (
                  <div key={transfer.id || index} className={styles.flightSection}>
                    <div className={styles.flightSectionHeader}>
                      <h3>{transfer.short_name || transfer.name}</h3>
                      <img src="/city.svg" alt="transfer" />
                    </div>

                    <div className={styles.transferImage}>
                      <img 
                        src={transfer.gallery?.[0]?.url || "/trans_1.png"} 
                        alt={transfer.name || "Трансфер"} 
                      />
                    </div>

                    <div className={styles.transferContent}>
                      <h4>{transfer.name}</h4>
                      <p>{transfer.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tour.hajj_kits && tour.hajj_kits.length > 0 && (
            <div className={styles.flightInfo}>
              <div className={styles.flightHeader}>
                <div className={styles.flightTitle}>
                  <img src="/hadj.svg" alt="hajj" />
                  <span>Хадж набор</span>
                </div>
              </div>

              <div className={styles.flightSections}>
                {tour.hajj_kits.map((kit, kitIndex) => (
                  <div key={kit.id || kitIndex} className={styles.flightSection}>
                    <div className={styles.flightSectionHeader}>
                      <h3>
                        {kit.gender === 'male' ? 'Для мужчин' : 
                         kit.gender === 'female' ? 'Для женщин' : 
                         'Унисекс'}
                      </h3>
                      <img src={kit.gender === 'male' ? "/man.svg" : 
                                   kit.gender === 'female' ? "/woman.svg" : 
                                   "/man.svg"} alt={kit.gender} />
                    </div>

                    <div className={styles.hajjGallery}>
                      {kit.gallery && kit.gallery.length > 0 ? (
                        kit.gallery.map((image, imgIndex) => (
                          <img 
                            key={imgIndex}
                            src={image.url} 
                            alt={kit.name || "Hajj Kit"}
                            onClick={() => openLightbox(getHajjKitImageIndex(kitIndex, imgIndex))}
                            style={{ cursor: 'pointer' }}
                          />
                        ))
                      ) : (
                        <img src="/man_1.png" alt="Hajj Kit" />
                      )}
                    </div>

                    <div className={styles.transferContent}>
                      <h4>{kit.name || "Atlas Collection"}</h4>
                      <p>{kit.description}</p>

                      {kit.items && kit.items.length > 0 && (
                        <div className={styles.amenities}>
                          <h4>Что входит в набор</h4>
                          <ul>
                            {kit.items.map((item, itemIndex) => (
                              <li key={itemIndex}>
                                <img src="/check-green.svg" alt="check" />
                                {item.item_text}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.flightInfo}>
            <div className={styles.flightHeader}>
              <div className={styles.flightTitle}>
                <img src="/check.svg" alt="shield" />
                <span>Что входит в пакет {tour.name}</span>
              </div>
            </div>

            <div className={styles.packageGrid}>
              {tour.package_includes && tour.package_includes.length > 0 && 
                tour.package_includes.map((item, index) => (
                  <div key={item.id || index} className={styles.packageCard}>
                    <img src="/check-green.svg" alt="check" />
                    <div className={styles.packageCardContent}>
                      <h4>{item.title}</h4>
                      <p>{stripHtml(item.description)}</p>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>

          <div
            id="accommodation-options"
            className={styles.accommodationOptions}
          >
            <div className={styles.accommodationOptionsHeader}>
              <div className={styles.accommodationOptionsTitle}>
                <img src="/bad.svg" alt="bed" />
                <span>Варианты размещения</span>
              </div>
            </div>

            <div className={styles.roomOptionsGrid}>
              {(() => {
                const roomOptions =
                  Array.isArray(tour.room_options) &&
                  tour.room_options.length > 0
                    ? tour.room_options
                    : [
                        {
                          type: "double",
                          price: 2400,
                          old_price: null,
                          spots_left: 4,
                          description:
                            "В номере с Вами будут размещены +1 человек",
                        },
                      ];

                return roomOptions.map((room, index) => (
                  <div key={index} className={styles.roomCard}>
                    <div className={styles.roomHeader}>
                      <div className={styles.roomIcons}>
                        <div className={styles.smallBeds}>
                          {Array.from({
                            length:
                              room.type === "single"
                                ? 1
                                : room.type === "double"
                                ? 2
                                : room.type === "triple"
                                ? 3
                                : room.type === "quadruple"
                                ? 4
                                : 4,
                          }).map((_, i) => (
                            <img key={i} src="/room.svg" alt="bed" />
                          ))}
                        </div>
                      </div>
                      <h3>
                        {room.type === "single"
                          ? "Одноместный номер"
                          : room.type === "double"
                          ? "Двухместный номер"
                          : room.type === "triple"
                          ? "Трехместный номер"
                          : room.type === "quadruple"
                          ? "Четырехместный номер"
                          : room.type}
                      </h3>
                    </div>

                    <div className={styles.roomInfo}>
                      <div className={styles.roomSection}>
                        <img src="/human.svg" alt="person" />
                        <div className={styles.roomSectionContent}>
                          <h4>Проживание</h4>
                          <span>
                            {room.description ||
                              "В номере с Вами будут размещены +1 человек"}
                          </span>
                        </div>
                      </div>
                      <div className={styles.roomSection}>
                        <img src="/bad.svg" alt="bed" />
                        <div className={styles.roomSectionContent}>
                          <h4>Типы кровати</h4>
                          <span>
                            {room.type === "single"
                              ? "1 односпальная кровать"
                              : room.type === "double"
                              ? "2 односпальные кровати"
                              : room.type === "triple"
                              ? "3 односпальные кровати"
                              : room.type === "quadruple"
                              ? "4 односпальные кровати"
                              : "4 односпальных кровати"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.availabilityInfo}>
                      <img src="/alert.svg" alt="alert" />
                      <span>Осталось {room.spots_left || 4} мест</span>
                    </div>

                    <div className={styles.roomPrice}>
                      <p>Без скрытых платежей</p>
                      <div className={styles.priceInfo}>
                        <span className={styles.currentPrice}>
                          ${room.price || 2400}
                        </span>
                        {room.old_price && (
                          <span className={styles.oldPrice}>
                            От ${room.old_price}
                          </span>
                        )}
                      </div>
                      <p className={styles.additionalPrice}>
                        ~{Math.round((room.price || 2400) * 547)}T
                      </p>
                    </div>

                    <button
                      className={styles.bookButton}
                      onClick={() => handleRoomBooking(room)}
                    >
                      Перейти к бронированию
                    </button>
                    <p className={styles.roomDescription}>
                      Оформите бронирование на себя и до 3-х спутников в одном
                      номере.
                    </p>
                  </div>
                ));
              })()}
            </div>
          </div>

          {tour.reviews && tour.reviews.length > 0 && (
            <div id="pilgrim-reviews" className={styles.pilgrimReviews}>
              <div className={styles.pilgrimReviewsHeader}>
                <div className={styles.pilgrimReviewsTitle}>
                  <img src="/review.svg" alt="chat" />
                  <span>Отзывы паломников</span>
                </div>
              </div>

              <div className={styles.reviewsGrid}>
                {tour.reviews.map((review, index) => (
                  <div key={index} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <div className={styles.userAvatar}>
                        {review.photo && review.photo.url ? (
                          <img src={review.photo.url} alt={review.name} />
                        ) : (
                          review.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className={styles.userInfo}>
                        <h4>{review.name}</h4>
                        <div className={styles.rating}>
                          <span>{review.rating} из 10</span>
                        </div>
                      </div>
                    </div>
                    <p className={styles.reviewText}>
                      {stripHtml(review.text)}
                    </p>
                    {review.date && (
                      <p className={styles.reviewDate}>
                        Дата поездки: {new Date(review.date).toLocaleDateString('ru-RU')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            className={`${styles.fixedBookingButton} ${
              !showBookingButton ? styles.hidden : ""
            }`}
          >
            <div className={styles.fixedBookingButtonContent}>
              <button
                className={styles.fixedBookButton}
                onClick={handleBooking}
              >
                Перейти к бронированию
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <BottomNavigation />

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={getGalleryImages()}
      />
    </div>
  );
}
