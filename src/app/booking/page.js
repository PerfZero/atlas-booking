"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { bookTour } from "../../lib/wordpress-api";
import Header from "../components/Header";
import HeaderBlue from "../components/HeaderBlue";
import Footer from "../components/Footer";
import BottomNavigation from "../components/BottomNavigation";
import styles from "./page.module.css";

function BookingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [tourData, setTourData] = useState(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [managerId, setManagerId] = useState("");
  const [showCongratulations, setShowCongratulations] = useState(true);
  const [tourists, setTourists] = useState([
    {
      id: 1,
      type: "adult",
      lastName: "",
      firstName: "",
      birthDate: "",
      gender: "",
      iin: "",
      passportNumber: "",
      passportIssueDate: "",
      passportExpiryDate: "",
      phone: ""
    }
  ]);
  const [errors, setErrors] = useState({});


  useEffect(() => {
    if (searchParams) {
      const data = {
        id: searchParams.get("id"),
        name: searchParams.get("name"),
        price: searchParams.get("price"),
        priceValue: searchParams.get("priceValue"),
        oldPrice: searchParams.get("oldPrice"),
        duration: searchParams.get("duration"),
        departure: searchParams.get("departure"),
        date: searchParams.get("date"),
        endDate: searchParams.get("endDate"),
        type: searchParams.get("type"),
        image: searchParams.get("image"),
        rating: searchParams.get("rating"),
        reviews: searchParams.get("reviews"),
        features: searchParams.get("features")?.split(",") || [],
        slug: searchParams.get("slug"),
        flightOutboundTime: searchParams.get("flightOutboundTime"),
        flightInboundTime: searchParams.get("flightInboundTime"),
        flightOutboundDate: searchParams.get("flightOutboundDate"),
        flightInboundDate: searchParams.get("flightInboundDate"),
        roomType: searchParams.get("roomType"),
        roomCapacity: searchParams.get("roomCapacity"),
        roomDescription: searchParams.get("roomDescription"),
        hotelMekka: searchParams.get("hotelMekka"),
        hotelMedina: searchParams.get("hotelMedina"),
        transferNames: searchParams.get("transferNames"),
        flightName: searchParams.get("flightName"),
        hajjKitNames: searchParams.get("hajjKitNames"),
        hajjKitTypes: searchParams.get("hajjKitTypes")
      };
      setTourData(data);
    }
  }, [searchParams]);

  // Автоматическое скрытие блока поздравления через 5 секунд
  useEffect(() => {
    if (showCongratulations) {
      const timer = setTimeout(() => {
        setShowCongratulations(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showCongratulations]);

  const calculateAge = (birthDate) => {
    if (!birthDate || birthDate.length !== 10) return null;
    
    // Парсим дату в формате YYYY-MM-DD
    const birth = new Date(birthDate);
    const today = new Date();
    
    // Проверяем, что дата валидная
    if (isNaN(birth.getTime())) return null;
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const validateAge = (touristId, type, birthDate) => {
    const age = calculateAge(birthDate);
    if (age === null) return null;

    if (type === "child" && (age < 2 || age > 12)) {
      return "Возраст ребенка должен быть 2-12 лет";
    }
    if (type === "infant" && age >= 2) {
      return "Возраст младенца должен быть меньше 2 лет";
    }
    if (type === "adult" && age < 12) {
      return "Возраст взрослого должен быть 12+ лет";
    }
    
    return null;
  };

  const validateDate = (dateString) => {
    if (!dateString || dateString.trim() === '') {
      return 'Дата обязательна';
    }
    
    // Проверяем формат YYYY-MM-DD (HTML5 date input)
    const dateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
    const match = dateString.match(dateRegex);
    
    if (!match) {
      return 'Неверный формат даты';
    }
    
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    
    // Проверяем корректность даты
    if (day < 1 || day > 31) {
      return 'Неверный день';
    }
    
    if (month < 1 || month > 12) {
      return 'Неверный месяц';
    }
    
    if (year < 1900 || year > new Date().getFullYear() + 5) {
      return 'Неверный год';
    }
    
    // Проверяем, что дата действительно существует
    const date = new Date(year, month - 1, day);
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
      return 'Неверная дата';
    }
    
    return null;
  };

  const validateTourist = (tourist) => {
    const errors = {};
    
    if (!tourist.lastName || tourist.lastName.trim() === '') {
      errors.lastName = 'Фамилия обязательна';
    }
    
    if (!tourist.firstName || tourist.firstName.trim() === '') {
      errors.firstName = 'Имя обязательно';
    }
    
    const birthDateError = validateDate(tourist.birthDate);
    if (birthDateError) {
      errors.birthDate = birthDateError;
    }
    
    if (!tourist.gender || tourist.gender.trim() === '') {
      errors.gender = 'Пол обязателен';
    }
    
    if (!tourist.iin || tourist.iin.trim() === '') {
      errors.iin = 'ИИН обязателен';
    } else if (tourist.iin.length !== 12) {
      errors.iin = 'ИИН должен содержать 12 цифр';
    }
    
    if (!tourist.passportNumber || tourist.passportNumber.trim() === '') {
      errors.passportNumber = 'Номер паспорта обязателен';
    }
    
    const passportIssueDateError = validateDate(tourist.passportIssueDate);
    if (passportIssueDateError) {
      errors.passportIssueDate = passportIssueDateError;
    }
    
    const passportExpiryDateError = validateDate(tourist.passportExpiryDate);
    if (passportExpiryDateError) {
      errors.passportExpiryDate = passportExpiryDateError;
    }
    
    if (tourist.id === 1 && (!tourist.phone || tourist.phone.trim() === '')) {
      errors.phone = 'Номер телефона обязателен';
    }
    
    const ageError = validateAge(tourist.id, tourist.type, tourist.birthDate);
    if (ageError) {
      errors.age = ageError;
    }
    
    return errors;
  };

  const isFormReady = () => {
    return tourists.every(tourist => {
      const errors = validateTourist(tourist);
      return Object.keys(errors).length === 0;
    });
  };

  const applyDateMask = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 4)}.${numbers.slice(4, 8)}`;
  };


  const applyPhoneMask = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 0) return '';
    if (numbers.length <= 1) return `+${numbers}`;
    if (numbers.length <= 4) return `+${numbers.slice(0, 1)} ${numbers.slice(1)}`;
    if (numbers.length <= 7) return `+${numbers.slice(0, 1)} ${numbers.slice(1, 4)} ${numbers.slice(4)}`;
    if (numbers.length <= 9) return `+${numbers.slice(0, 1)} ${numbers.slice(1, 4)} ${numbers.slice(4, 7)} ${numbers.slice(7)}`;
    return `+${numbers.slice(0, 1)} ${numbers.slice(1, 4)} ${numbers.slice(4, 7)} ${numbers.slice(7, 9)} ${numbers.slice(9, 11)}`;
  };

  const applyIinMask = (value) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.slice(0, 12);
  };

  const applyPassportMask = (value) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.slice(0, 9);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Дата не указана';
    
    // Если дата в формате YYYYMMDD
    if (dateString.length === 8) {
      const year = dateString.substring(0, 4);
      const month = dateString.substring(4, 6);
      const day = dateString.substring(6, 8);
      const date = new Date(year, month - 1, day);
      
      const weekdays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
      const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 
                     'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
      
      return `${weekdays[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    }
    
    // Если дата в другом формате, пытаемся парсить
    try {
      const date = new Date(dateString);
      const weekdays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
      const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 
                     'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
      
      return `${weekdays[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch (error) {
      return dateString;
    }
  };

  const handleInputChange = (touristId, field, value) => {
    let maskedValue = value;
    
    if (field === 'birthDate' || field === 'passportIssueDate' || field === 'passportExpiryDate') {
      // Для HTML5 date input не нужна маска, значение уже в формате YYYY-MM-DD
      maskedValue = value;
    } else if (field === 'phone') {
      maskedValue = applyPhoneMask(value);
    } else if (field === 'iin') {
      maskedValue = applyIinMask(value);
    } else if (field === 'passportNumber') {
      maskedValue = applyPassportMask(value);
    } else if (field === 'lastName' || field === 'firstName') {
      maskedValue = value.toUpperCase().replace(/[^A-Z\s]/g, '');
    }

    setTourists(prev => prev.map(tourist => 
      tourist.id === touristId 
        ? { ...tourist, [field]: maskedValue }
        : tourist
    ));

    // Очищаем ошибку для этого поля при вводе
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`${touristId}-${field}`];
      return newErrors;
    });

    if (field === 'birthDate' || field === 'type') {
      const tourist = tourists.find(t => t.id === touristId);
      if (tourist) {
        const newType = field === 'type' ? value : tourist.type;
        const newBirthDate = field === 'birthDate' ? maskedValue : tourist.birthDate;
        
        const ageError = validateAge(touristId, newType, newBirthDate);
        setErrors(prev => ({
          ...prev,
          [`${touristId}-age`]: ageError
        }));
      }
    }
  };

  const addTourist = () => {
    const newId = Math.max(...tourists.map(t => t.id)) + 1;
    setTourists(prev => [...prev, {
      id: newId,
      type: "adult",
      lastName: "",
      firstName: "",
      birthDate: "",
      gender: "",
      iin: "",
      passportNumber: "",
      passportIssueDate: "",
      passportExpiryDate: "",
      phone: ""
    }]);
  };

  const removeTourist = (touristId) => {
    if (tourists.length > 1) {
      setTourists(prev => prev.filter(tourist => tourist.id !== touristId));
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${touristId}-age`];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    let hasErrors = false;
    
    tourists.forEach(tourist => {
      const touristErrors = validateTourist(tourist);
      if (Object.keys(touristErrors).length > 0) {
        hasErrors = true;
        Object.keys(touristErrors).forEach(field => {
          newErrors[`${tourist.id}-${field}`] = touristErrors[field];
        });
      }
    });

    setErrors(newErrors);

    if (!hasErrors) {
      setIsReviewMode(true);
    }
  };

  const handleEdit = () => {
    setIsReviewMode(false);
  };

  const handleChangeSelection = () => {
    // Возвращаемся к странице тура с якорем на секцию размещения
    window.location.href = `/tour/${tourData.slug}#accommodation-options`;
  };

  const handlePayment = async () => {
    if (!isAuthenticated || !user) {
      router.push('/auth?mode=login');
      return;
    }

    try {
      const token = localStorage.getItem('atlas_token');
      const tourDataForBooking = {
        ...tourData,
        tourists: tourists,
        totalPrice: tourData.price,
        bookingDate: new Date().toISOString()
      };

      const result = await bookTour(token, tourData.id, tourDataForBooking);
      
      if (result.success) {
        const orderId = result.booking_id;
        const amount = Math.round(tourData.priceValue * 547 * tourists.length);
        const tourId = tourData.id;
        
        const paymentRequestData = {
          order_id: orderId,
          amount: amount,
          tour_id: parseInt(tourId),
          token: token
        };
        
        console.log('Отправляем запрос на создание платежа:', paymentRequestData);
        const paymentResponse = await fetch('https://api.booking.atlas.kz/wp-json/atlas/v1/kaspi/create-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentRequestData)
        });
        
        console.log('Получен ответ от сервера:', {
          status: paymentResponse.status,
          statusText: paymentResponse.statusText,
          headers: Object.fromEntries(paymentResponse.headers.entries())
        });

                                                if (!paymentResponse.ok) {
                      const errorData = await paymentResponse.json();
                      throw new Error(errorData.message || 'Ошибка создания платежа');
                    }
            
                    // Бэкенд вернет JSON с URL для оплаты от Kaspi
                    const paymentResult = await paymentResponse.json();
                    console.log('Получен ответ от бэкенда:', paymentResult);
                    
                    if (paymentResult.success && paymentResult.payment_url) {
                      console.log('Получен URL для оплаты:', paymentResult.payment_url);
                      
                      // Перенаправляем на URL оплаты от Kaspi
                      window.location.href = paymentResult.payment_url;
                    } else {
                      throw new Error('Неверный ответ от сервера');
                    }
      } else {
        alert('Ошибка при бронировании тура: ' + (result.error || 'Неизвестная ошибка'));
      }
    } catch (error) {
      console.error('Ошибка при бронировании:', error);
      alert('Ошибка при бронировании тура: ' + error.message);
    }
  };

  if (!tourData) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className={styles.page}>
      <HeaderBlue invertLogo={true} buttonStyle="search" tourTitle={tourData.name} />
      
      <main className={styles.main}>
        <div className={styles.container}>
          {showCongratulations && (
            <div className={styles.congratulationsBlock}>
              <div className={styles.congratulationsContent}>
                <div className={styles.congratulationsIcon}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" fill="#4CAF50"/>
                    <path d="M6.25 10L8.75 12.5L13.75 7.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className={styles.congratulationsText}>
                  <div className={styles.congratulationsTitle}>Поздравляем! Вы успешно прошли регистрацию!</div>
                  <div className={styles.congratulationsSubtitle}>Отныне, Вы можете продолжить бронирование и управлять им через личный кабинет.</div>
                </div>
                <button 
                  className={styles.congratulationsClose}
                  onClick={() => setShowCongratulations(false)}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill}></div>
              </div>
            </div>
          )}

          <div className={styles.content}>
            <div className={styles.leftColumn}>
              <div className={styles.costDetails}>
                <h3>Детали стоимости</h3>
                <p className={styles.noHiddenFees}>Без скрытых платежей</p>
                <div className={styles.priceInfo}>
                  <div className={styles.mainPrice}>
                    <span className={styles.currentPrice}>${tourData.price * tourists.length}</span>
                    {tourData.oldPrice && (
                      <span className={styles.oldPrice}>От ${tourData.oldPrice * tourists.length}</span>
                    )}
                  </div>
                  <span className={styles.usdPrice}>~{Math.round(tourData.priceValue * 547 * tourists.length)}₸</span>
                </div>
              </div>

              <div className={styles.tourDetails}>
                <h3>Детали Вашего турпакета</h3>
                <div className={styles.rating}>
                  <div className={styles.ratingBadge}>{tourData.rating}</div>
                  <span className={styles.ratingText}>Превосходно</span>
                  <span className={styles.ratingDot}>•</span>
                  <span className={styles.reviewsCount}>{tourData.reviews} отзывов</span>
                </div>
                <div className={styles.packageDetails}>
                  <div className={styles.packageItem}>
                    <div className={styles.packageName}>{tourData.name}</div>
                    <div className={styles.packageType}>Турпакет</div>
                  </div>
                  <div className={styles.packageItem}>
                    <div className={styles.packageName}>{tourData.flightName || "Air Astana"} - Прямой рейс</div>
                    <div className={styles.packageType}>Перелет</div>
                  </div>
                  <div className={styles.packageItem}>
                    <div className={styles.packageName}>{tourData.hotelMekka || "Отель в Мекке"}</div>
                    <div className={styles.packageType}>Отель в Мекке</div>
                  </div>
                  <div className={styles.packageItem}>
                    <div className={styles.packageName}>{tourData.hotelMedina || "Отель в Медине"}</div>
                    <div className={styles.packageType}>Отель в Медине</div>
                  </div>
                  <div className={styles.packageItem}>
                    <div className={styles.packageName}>{tourData.transferNames || "Комфортабельный автобус и высокоскоростной поезд"}</div>
                    <div className={styles.packageType}>Трансфер</div>
                  </div>
                  <div className={styles.packageItem}>
                    <div className={styles.packageName}>Полный хадж набор</div>
                    <div className={styles.packageType}>{tourData.hajjKitTypes || "Для мужчин и женщин"}</div>
                  </div>
                </div>
                <button className={styles.allInclusive}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M6.97097 13.8035C10.7076 13.8035 13.8013 10.7031 13.8013 6.97317C13.8013 3.23657 10.7009 0.142822 6.96428 0.142822C3.23437 0.142822 0.140625 3.23657 0.140625 6.97317C0.140625 10.7031 3.24107 13.8035 6.97097 13.8035Z" fill="white" />
  <path d="M6.22766 10.2478C6.00001 10.2478 5.8125 10.154 5.63839 9.91967L3.95759 7.85716C3.85714 7.72322 3.79688 7.5759 3.79688 7.4219C3.79688 7.12053 4.03125 6.87276 4.33259 6.87276C4.52678 6.87276 4.67411 6.93305 4.84151 7.15402L6.20092 8.90847L9.06029 4.31475C9.18749 4.11386 9.36161 4.00671 9.53572 4.00671C9.83035 4.00671 10.1049 4.20761 10.1049 4.52234C10.1049 4.66966 10.0178 4.82368 9.93749 4.9643L6.79018 9.91967C6.64955 10.1406 6.45538 10.2478 6.22766 10.2478Z" fill="#253168" />
</svg>
                  Всё включено
                </button>
              </div>

              <div className={styles.bookingDates}>
                <h3>Даты Вашего бронирования</h3>
                <div className={styles.dateInfo}>
                  <div className={styles.datesRow}>
                    <div className={styles.dateItem}>
                      <div className={styles.dateValue}>{formatDate(tourData.flightOutboundDate || tourData.date)}</div>
                      <div className={styles.dateLabel}>Вылет</div>
                    </div>
                    <div className={styles.dateDivider}></div>
                    <div className={styles.dateItem}>
                      <div className={styles.dateValue}>{formatDate(tourData.flightInboundDate || tourData.endDate)}</div>
                      <div className={styles.dateLabel}>Прилет</div>
                    </div>
                  </div>
                  
                  <div className={styles.separator}></div>
                  
                  <div className={styles.durationInfo}>
                    <div className={styles.durationValue}>{tourData.duration}</div>
                    <div className={styles.durationLabel}>Общая длительность тура</div>
                  </div>
                  
                  <div className={styles.separator}></div>
                  
                  <div className={styles.accommodationInfo}>
                    <div className={styles.accommodationTitle}>
                      {tourData.roomCapacity ? `${tourData.roomCapacity}-х местное размещение` : '4-х местное размещение'}
                    </div>
                    <div className={styles.accommodationDetails}>
                      <div className={styles.accommodationItem}>
                        {tourData.roomDescription || 'В номере с Вами будут размещены +3 человека'}
                      </div>
                      <div className={styles.accommodationItem}>
                        {tourData.roomCapacity ? `${tourData.roomCapacity} односпальных кровати` : '4 односпальных кровати'}
                      </div>
                    </div>
                    <div className={styles.accommodationType}>
                      <div className={styles.accommodationTypeLabel}>Ваш тип размещения</div>
                      <button className={styles.changeSelection} onClick={handleChangeSelection}>Изменить выбор</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.rightColumnWrapper}>
              <div className={styles.rightColumn}>
                {!isReviewMode ? (
                  <form className={styles.bookingForm} onSubmit={handleSubmit}>
                    {tourists.map((tourist, index) => (
                      <div key={tourist.id} className={styles.touristForm}>
                        <div className={styles.touristHeader}>
                          <h3>{index === 0 ? 'Введите ваши данные' : `Данные ${index + 1}-го туриста`}</h3>
                          {tourists.length > 1 && index > 0 && (
                            <button 
                              type="button" 
                              className={styles.removeTourist}
                              onClick={() => removeTourist(tourist.id)}
                            >
                              Удалить {index + 1}-го туриста
                            </button>
                          )}
                        </div>

                        {index > 0 && (
                          <div className={styles.touristType}>
                            <div className={styles.radioGroup}>
                              <label>
                                <input
                                  type="radio"
                                  name={`touristType-${tourist.id}`}
                                  value="adult"
                                  checked={tourist.type === "adult"}
                                  onChange={(e) => handleInputChange(tourist.id, "type", e.target.value)}
                                />
                                Взрослый (12+ лет)
                              </label>
                              <label>
                                <input
                                  type="radio"
                                  name={`touristType-${tourist.id}`}
                                  value="child"
                                  checked={tourist.type === "child"}
                                  onChange={(e) => handleInputChange(tourist.id, "type", e.target.value)}
                                />
                                Ребёнок (2-12 лет)
                              </label>
                              <label>
                                <input
                                  type="radio"
                                  name={`touristType-${tourist.id}`}
                                  value="infant"
                                  checked={tourist.type === "infant"}
                                  onChange={(e) => handleInputChange(tourist.id, "type", e.target.value)}
                                />
                                Младенец (до 2 лет)
                              </label>
                            </div>
                          </div>
                        )}
                        
                        <div className={styles.formGrid}>
                          <div className={styles.formGroup}>
                            <label>Фамилия</label>
                            <input
                              type="text"
                              value={tourist.lastName}
                              onChange={(e) => handleInputChange(tourist.id, "lastName", e.target.value)}
                              placeholder="IVANOV"
                              required
                              className={errors[`${tourist.id}-lastName`] ? styles.error : ''}
                            />
                            <p className={styles.nameHint}>
                              Только английскими заглавными буквами
                            </p>
                            {errors[`${tourist.id}-lastName`] && (
                              <div className={styles.errorMessage}>{errors[`${tourist.id}-lastName`]}</div>
                            )}
                          </div>

                          <div className={styles.formGroup}>
                            <label>Имя</label>
                            <input
                              type="text"
                              value={tourist.firstName}
                              onChange={(e) => handleInputChange(tourist.id, "firstName", e.target.value)}
                              placeholder="IVAN"
                              required
                              className={errors[`${tourist.id}-firstName`] ? styles.error : ''}
                            />
                            <p className={styles.nameHint}>
                              Только английскими заглавными буквами
                            </p>
                            {errors[`${tourist.id}-firstName`] && (
                              <div className={styles.errorMessage}>{errors[`${tourist.id}-firstName`]}</div>
                            )}
                          </div>

                          <div className={styles.formGroup}>
                            <label>Дата рождения</label>
                            <input
                              type="date"
                              value={tourist.birthDate}
                              onChange={(e) => handleInputChange(tourist.id, "birthDate", e.target.value)}
                              required
                              className={errors[`${tourist.id}-birthDate`] || errors[`${tourist.id}-age`] ? styles.error : ''}
                            />
                            {errors[`${tourist.id}-birthDate`] && (
                              <div className={styles.errorMessage}>{errors[`${tourist.id}-birthDate`]}</div>
                            )}
                            {errors[`${tourist.id}-age`] && (
                              <div className={styles.errorMessage}>{errors[`${tourist.id}-age`]}</div>
                            )}
                          </div>

                          <div className={styles.formGroup}>
                            <label>Пол</label>
                            <div className={styles.radioGroup}>
                              <label>
                                <input
                                  type="radio"
                                  name={`gender-${tourist.id}`}
                                  value="male"
                                  checked={tourist.gender === "male"}
                                  onChange={(e) => handleInputChange(tourist.id, "gender", e.target.value)}
                                />
                                Мужчина
                              </label>
                              <label>
                                <input
                                  type="radio"
                                  name={`gender-${tourist.id}`}
                                  value="female"
                                  checked={tourist.gender === "female"}
                                  onChange={(e) => handleInputChange(tourist.id, "gender", e.target.value)}
                                />
                                Женщина
                              </label>
                            </div>
                            {errors[`${tourist.id}-gender`] && (
                              <div className={styles.errorMessage}>{errors[`${tourist.id}-gender`]}</div>
                            )}
                          </div>

                          <div className={styles.formGroup}>
                            <label>ИИН</label>
                            <input
                              type="text"
                              value={tourist.iin}
                              onChange={(e) => handleInputChange(tourist.id, "iin", e.target.value)}
                              placeholder="Введите Ваш ИИН"
                              maxLength={12}
                              required
                              className={errors[`${tourist.id}-iin`] ? styles.error : ''}
                            />
                            {errors[`${tourist.id}-iin`] && (
                              <div className={styles.errorMessage}>{errors[`${tourist.id}-iin`]}</div>
                            )}
                          </div>

                          <div className={styles.formGroup}>
                            <label>Номер паспорта (без №)</label>
                            <div className={styles.passportInput}>
                              <span className={styles.passportPrefix}>N</span>
                              <input
                                type="text"
                                value={tourist.passportNumber}
                                onChange={(e) => handleInputChange(tourist.id, "passportNumber", e.target.value)}
                                placeholder="123456789"
                                maxLength={9}
                                required
                                className={errors[`${tourist.id}-passportNumber`] ? styles.error : ''}
                              />
                            </div>
                            {errors[`${tourist.id}-passportNumber`] && (
                              <div className={styles.errorMessage}>{errors[`${tourist.id}-passportNumber`]}</div>
                            )}
                          </div>

                          <div className={styles.formGroup}>
                            <label>Дата выдачи паспорта</label>
                            <input
                              type="date"
                              value={tourist.passportIssueDate}
                              onChange={(e) => handleInputChange(tourist.id, "passportIssueDate", e.target.value)}
                              required
                              className={errors[`${tourist.id}-passportIssueDate`] ? styles.error : ''}
                            />
                            {errors[`${tourist.id}-passportIssueDate`] && (
                              <div className={styles.errorMessage}>{errors[`${tourist.id}-passportIssueDate`]}</div>
                            )}
                          </div>

                          <div className={styles.formGroup}>
                            <label>Срок действия паспорта</label>
                            <input
                              type="date"
                              value={tourist.passportExpiryDate}
                              onChange={(e) => handleInputChange(tourist.id, "passportExpiryDate", e.target.value)}
                              required
                              className={errors[`${tourist.id}-passportExpiryDate`] ? styles.error : ''}
                            />
                            {errors[`${tourist.id}-passportExpiryDate`] && (
                              <div className={styles.errorMessage}>{errors[`${tourist.id}-passportExpiryDate`]}</div>
                            )}
                          </div>

                          {index === 0 && (
                            <div className={styles.formGroup}>
                              <label>Введите номер телефона</label>
                              <input
                                type="tel"
                                value={tourist.phone}
                                onChange={(e) => handleInputChange(tourist.id, "phone", e.target.value)}
                                placeholder="+7 --- ---- ----"
                                required
                                className={errors[`${tourist.id}-phone`] ? styles.error : ''}
                              />
                            
                              {errors[`${tourist.id}-phone`] && (
                                <div className={styles.errorMessage}>{errors[`${tourist.id}-phone`]}</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    <div className={styles.addTouristSection}>
                      <button type="button" className={styles.addTourist} onClick={addTourist}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 1V15M1 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Добавить еще туриста
                      </button>
                      <div className={styles.addTouristNote}>
                        При добавлении еще туристов, Вы будете оплачивать за всех, кого Вы добавите.
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className={styles.reviewForm}>
                    {tourists.map((tourist, index) => (
                      <div key={tourist.id} className={styles.touristReview}>
                        <div className={styles.touristHeader}>
                          <h3>{index === 0 ? 'Проверьте Ваши данные' : `Проверьте данные ${index + 1}-го туриста`}</h3>
                        </div>
                        
                        <div className={styles.reviewGrid}>
                          <div className={styles.reviewGroup}>
                            <label>Фамилия</label>
                            <div className={styles.reviewValue}>{tourist.lastName}</div>
                          </div>

                          <div className={styles.reviewGroup}>
                            <label>Имя</label>
                            <div className={styles.reviewValue}>{tourist.firstName}</div>
                          </div>

                          <div className={styles.reviewGroup}>
                            <label>Дата рождения</label>
                            <div className={styles.reviewValue}>{tourist.birthDate}</div>
                          </div>

                          <div className={styles.reviewGroup}>
                            <label>Пол</label>
                            <div className={styles.reviewValue}>{tourist.gender === 'male' ? 'Мужчина' : 'Женщина'}</div>
                          </div>

                          <div className={styles.reviewGroup}>
                            <label>ИИН</label>
                            <div className={styles.reviewValue}>{tourist.iin}</div>
                          </div>

                          <div className={styles.reviewGroup}>
                            <label>Номер паспорта</label>
                            <div className={styles.reviewValue}>N {tourist.passportNumber}</div>
                          </div>

                          <div className={styles.reviewGroup}>
                            <label>Дата выдачи паспорта</label>
                            <div className={styles.reviewValue}>{tourist.passportIssueDate}</div>
                          </div>

                          <div className={styles.reviewGroup}>
                            <label>Срок действия паспорта</label>
                            <div className={styles.reviewValue}>{tourist.passportExpiryDate}</div>
                          </div>

                          {index === 0 && (
                            <div className={styles.reviewGroup}>
                              <label>Номер телефона</label>
                              <div className={styles.reviewValue}>{tourist.phone}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    <div className={styles.managerSection}>
                      <div className={styles.reviewGroup}>
                        <label>ID менеджера</label>
                        <input
                          type="text"
                          value={managerId}
                          onChange={(e) => setManagerId(e.target.value)}
                          placeholder="Введите ID менеджера"
                          className={styles.managerInput}
                        />
                      </div>
                    </div>

                    <div className={styles.reviewActions}>
                      <button className={styles.kaspiButton} onClick={handlePayment}>
                        Оплатить через Kaspi
                      </button>
                      <button className={styles.editLink} onClick={handleEdit}>
                        Изменить данные
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {!isReviewMode && (
                <button 
                  className={styles.paymentButton} 
                  onClick={handleSubmit}
                  disabled={!isFormReady()}
                >
                  Перейти к оплате
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNavigation />
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <BookingPageContent />
    </Suspense>
  );
}
