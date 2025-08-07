"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "../components/Header";
import HeaderBlue from "../components/HeaderBlue";
import Footer from "../components/Footer";
import styles from "./page.module.css";

function BookingPageContent() {
  const searchParams = useSearchParams();
  const [tourData, setTourData] = useState(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
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
        type: searchParams.get("type"),
        image: searchParams.get("image"),
        rating: searchParams.get("rating"),
        reviews: searchParams.get("reviews"),
        features: searchParams.get("features")?.split(",") || [],
        slug: searchParams.get("slug")
      };
      setTourData(data);
    }
  }, [searchParams]);

  const calculateAge = (birthDate) => {
    if (!birthDate || birthDate.length !== 10) return null;
    
    const [day, month, year] = birthDate.split('.');
    const birth = new Date(year, month - 1, day);
    const today = new Date();
    
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

  const handleInputChange = (touristId, field, value) => {
    let maskedValue = value;
    
    if (field === 'birthDate' || field === 'passportIssueDate' || field === 'passportExpiryDate') {
      maskedValue = applyDateMask(value);
    } else if (field === 'phone') {
      maskedValue = applyPhoneMask(value);
    } else if (field === 'iin') {
      maskedValue = applyIinMask(value);
    } else if (field === 'passportNumber') {
      maskedValue = applyPassportMask(value);
    }

    setTourists(prev => prev.map(tourist => 
      tourist.id === touristId 
        ? { ...tourist, [field]: maskedValue }
        : tourist
    ));

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
    tourists.forEach(tourist => {
      const ageError = validateAge(tourist.id, tourist.type, tourist.birthDate);
      if (ageError) {
        newErrors[`${tourist.id}-age`] = ageError;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsReviewMode(true);
      console.log("Данные туристов:", tourists);
      console.log("Данные тура:", tourData);
    } else {
      console.log("Ошибки валидации:", newErrors);
    }
  };

  const handleEdit = () => {
    setIsReviewMode(false);
  };

  if (!tourData) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className={styles.page}>
      <HeaderBlue invertLogo={true} buttonStyle="search" tourTitle={tourData.name} />
      
      <main className={styles.main}>
        <div className={styles.container}>
        

          <div className={styles.content}>
            <div className={styles.leftColumn}>
              <div className={styles.costDetails}>
                <h3>Детали стоимости</h3>
                <p className={styles.noHiddenFees}>Без скрытых платежей</p>
                <div className={styles.priceInfo}>
                  <div className={styles.mainPrice}>
                    <span className={styles.currentPrice}>{tourData.priceValue}₸</span>
                    <span className={styles.oldPrice}>От {tourData.oldPrice}₸</span>

                  </div>
                  <span className={styles.usdPrice}>${tourData.price}</span>

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
                    <div className={styles.packageName}>Fairmont Package</div>
                    <div className={styles.packageType}>Турпакет</div>
                  </div>
                  <div className={styles.packageItem}>
                    <div className={styles.packageName}>Air Astana - Прямой рейс</div>
                    <div className={styles.packageType}>Перелет</div>
                  </div>
                  <div className={styles.packageItem}>
                    <div className={styles.packageName}>Fairmont Makkah</div>
                    <div className={styles.packageType}>Отель в Мекке</div>
                  </div>
                  <div className={styles.packageItem}>
                    <div className={styles.packageName}>Waqf Al Safi</div>
                    <div className={styles.packageType}>Отель в Медине</div>
                  </div>
                  <div className={styles.packageItem}>
                    <div className={styles.packageName}>Комфортабельный автобус Высокоскоростной поезд</div>
                    <div className={styles.packageType}>Трансфер</div>
                  </div>
                  <div className={styles.packageItem}>
                    <div className={styles.packageName}>Полный хадж набор</div>
                    <div className={styles.packageType}>Для мужчин и женщин</div>
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
                      <div className={styles.dateValue}>Пт, 20 июля 2025</div>
                      <div className={styles.dateLabel}>Вылет</div>
                    </div>
                    <div className={styles.dateDivider}></div>
                    <div className={styles.dateItem}>
                      <div className={styles.dateValue}>Пт, 26 июля 2025</div>
                      <div className={styles.dateLabel}>Вылет</div>
                    </div>
                  </div>
                  
                  <div className={styles.separator}></div>
                  
                  <div className={styles.durationInfo}>
                    <div className={styles.durationValue}>3 дня в Медине · 3 дня в Мекке</div>
                    <div className={styles.durationLabel}>Общая длительность тура</div>
                  </div>
                  
                  <div className={styles.separator}></div>
                  
                  <div className={styles.accommodationInfo}>
                    <div className={styles.accommodationTitle}>4-х местное размещение</div>
                    <div className={styles.accommodationDetails}>
                      <div className={styles.accommodationItem}>В номере с Вами будут размещены +3 человека</div>
                      <div className={styles.accommodationItem}>4 односпальных кровати</div>
                    </div>
                    <div className={styles.accommodationType}>
                      <div className={styles.accommodationTypeLabel}>Ваш тип размещения</div>
                      <button className={styles.changeSelection}>Изменить выбор</button>
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
                          <h3>Данные {index + 1}-го туриста</h3>
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
                              placeholder="Введите фамилию как в загран. паспорте"
                              required
                            />
                          </div>

                          <div className={styles.formGroup}>
                            <label>Имя</label>
                            <input
                              type="text"
                              value={tourist.firstName}
                              onChange={(e) => handleInputChange(tourist.id, "firstName", e.target.value)}
                              placeholder="Введите имя как в загран. паспорте"
                              required
                            />
                          </div>

                          <div className={styles.formGroup}>
                            <label>Дата рождения</label>
                            <input
                              type="text"
                              value={tourist.birthDate}
                              onChange={(e) => handleInputChange(tourist.id, "birthDate", e.target.value)}
                              placeholder="дд.мм.гггг"
                              maxLength={10}
                              required
                              className={index > 0 && errors[`${tourist.id}-age`] ? styles.error : ''}
                            />
                            {index > 0 && errors[`${tourist.id}-age`] && (
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
                            />
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
                              />
                            </div>
                          </div>

                          <div className={styles.formGroup}>
                            <label>Дата выдачи паспорта</label>
                            <input
                              type="text"
                              value={tourist.passportIssueDate}
                              onChange={(e) => handleInputChange(tourist.id, "passportIssueDate", e.target.value)}
                              placeholder="дд.мм.гггг"
                              maxLength={10}
                              required
                            />
                          </div>

                          <div className={styles.formGroup}>
                            <label>Срок действия паспорта</label>
                            <input
                              type="text"
                              value={tourist.passportExpiryDate}
                              onChange={(e) => handleInputChange(tourist.id, "passportExpiryDate", e.target.value)}
                              placeholder="дд.мм.гггг"
                              maxLength={10}
                              required
                            />
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
                              />
                              <p className={styles.phoneNote}>
                                По этому номеру телефона Вы подпишите договор и получите ваучер.
                              </p>
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

                    <div className={styles.reviewActions}>
                      <button className={styles.kaspiButton}>
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
                <button className={styles.paymentButton} onClick={handleSubmit}>
                  Перейти к оплате
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
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
