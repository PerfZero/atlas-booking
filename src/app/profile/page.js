"use client";
import { useState, useEffect } from "react";
import HeaderProfile from "../components/HeaderProfile";
import Footer from "../components/Footer";
import styles from "./page.module.css";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("tourist-data");
  const [timer1, setTimer1] = useState({ minutes: 19, seconds: 32 });
  const [timer2, setTimer2] = useState({ minutes: 15, seconds: 48 });
  const [formData, setFormData] = useState({
    firstName: "NURALY",
    lastName: "KOPBOSSYN",
    birthDate: "19.09.1998",
    gender: "male",
    phone: "+7 777 253 9319",
    iin: "980919300267",
    passportNumber: "123456789",
    passportIssueDate: "19.09.2020",
    passportExpiryDate: "19.09.2028"
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer1(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        }
        return prev;
      });

      setTimer2(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    console.log("Сохранение данных:", formData);
  };

  return (
    <div className={styles.page}>
      <HeaderProfile />
      
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === "tourist-data" ? styles.active : ""}`}
              onClick={() => setActiveTab("tourist-data")}
            >
              Данные туриста
            </button>
            <button 
              className={`${styles.tab} ${activeTab === "booked-tours" ? styles.active : ""}`}
              onClick={() => setActiveTab("booked-tours")}
            >
              Забронированные туры
            </button>
            <button 
              className={`${styles.tab} ${activeTab === "pending-payment" ? styles.active : ""}`}
              onClick={() => setActiveTab("pending-payment")}
            >
              Туры ожидающие оплаты
            </button>
          </div>

          <div className={styles.content}>
            {activeTab === "tourist-data" && (
              <div className={styles.leftColumn}>
                <div className={styles.dataSection}>
                  <h2 className={styles.sectionTitle}>Ваши данные</h2>
                  
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label>Имя</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Пол</label>
                      <div className={styles.radioGroup}>
                        <label>
                          <input
                            type="radio"
                            name="gender"
                            value="male"
                            checked={formData.gender === "male"}
                            onChange={(e) => handleInputChange("gender", e.target.value)}
                          />
                          Мужчина
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="gender"
                            value="female"
                            checked={formData.gender === "female"}
                            onChange={(e) => handleInputChange("gender", e.target.value)}
                          />
                          Женщина
                        </label>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Фамилия</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Дата выдачи паспорта</label>
                      <input
                        type="text"
                        value={formData.passportIssueDate}
                        onChange={(e) => handleInputChange("passportIssueDate", e.target.value)}
                        placeholder="дд.мм.гггг"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Номер телефона</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Номер паспорта</label>
                      <div className={styles.passportInput}>
                        <span className={styles.passportPrefix}>N</span>
                        <input
                          type="text"
                          value={formData.passportNumber}
                          onChange={(e) => handleInputChange("passportNumber", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Дата рождения</label>
                      <input
                        type="text"
                        value={formData.birthDate}
                        onChange={(e) => handleInputChange("birthDate", e.target.value)}
                        placeholder="дд.мм.гггг"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Срок действия паспорта</label>
                      <input
                        type="text"
                        value={formData.passportExpiryDate}
                        onChange={(e) => handleInputChange("passportExpiryDate", e.target.value)}
                        placeholder="дд.мм.гггг"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>ИИН</label>
                      <input
                        type="text"
                        value={formData.iin}
                        onChange={(e) => handleInputChange("iin", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className={styles.saveButton}>
                  <button onClick={handleSave}>
                    Сохранить
                  </button>
                </div>
              </div>
            )}

            {activeTab === "booked-tours" && (
              <div className={styles.leftColumn}>
                <div className={styles.tourCard}>
                  <div className={styles.tourImage}>
                    <img src="/tour_1.png" alt="Отель в Медине" />
                  </div>
                  <div className={styles.tourContent}>
                    <h3 className={styles.tourTitle}>3 дня в Медине · 3 дня в Мекке</h3>
                    <div className={styles.tourFeatures}>
                      <div className={styles.feature}>
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M10.9565 21.2053C16.5614 21.2053 21.202 16.5547 21.202 10.9598C21.202 5.35492 16.5514 0.714294 10.9464 0.714294C5.35156 0.714294 0.710938 5.35492 0.710938 10.9598C0.710938 16.5547 5.36161 21.2053 10.9565 21.2053Z" fill="white" />
  <path d="M9.8415 15.8717C9.50001 15.8717 9.21875 15.731 8.95759 15.3795L6.43638 12.2857C6.28572 12.0848 6.19531 11.8638 6.19531 11.6328C6.19531 11.1808 6.54688 10.8091 6.99888 10.8091C7.29018 10.8091 7.51116 10.8995 7.76227 11.231L9.80138 13.8627L14.0904 6.97209C14.2812 6.67075 14.5424 6.51004 14.8036 6.51004C15.2455 6.51004 15.6574 6.81138 15.6574 7.28347C15.6574 7.50446 15.5268 7.73549 15.4062 7.94642L10.6853 15.3795C10.4743 15.7109 10.1831 15.8717 9.8415 15.8717Z" fill="#253168" />
</svg>                        <span>Всё включено</span>
                      </div>
                      <div className={styles.feature}>
                        <img src="/airplane.svg" alt="Прямой рейс" />
                        <span>Прямой рейс</span>
                      </div>
                    </div>
                    <div className={styles.hotelInfo}>
                      <div className={styles.hotel}>
                        <div className={styles.hotelImage}>
                        <img src="/mekka.svg" alt="Отель" />
                        </div>
                        <div className={styles.hotelContent}>
                        <span className={styles.hotelName}>5* отель в Мекке</span>
                        <span className={styles.distance}>Расстояние до Каабы 50 м.</span>
                        </div>
                      </div>
                      <div className={styles.hotel}>
                        <div className={styles.hotelImage}>
                        <img src="/medina.svg" alt="Медина" />
                        </div>
                        <div className={styles.hotelContent}>
                            <span className={styles.hotelName}>5* отель в Медине</span>
                        <span className={styles.distance}>Расстояние до мечети 150 м.</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.wrapper}>
                    <div className={styles.tourPrice}>
                      <div className={styles.priceStatus}>Оплачено (1 чел)</div>
                      <div className={styles.priceAmount}>
                        <span className={styles.priceKzt}>1 312 500₸</span>
                        <span className={styles.priceUsd}>$2400</span>
                      </div>
                    </div>
                    <div className={styles.tourDates}>
                      <div className={styles.dateRange}>
                        <span className={styles.date}>24 авг</span>
                        <span className={styles.arrow}>→</span>
                        <span className={styles.date}>31 авг</span>
                      </div>
                      <div className={styles.dateLabels}>
                        <span className={styles.departure}>Вылет</span>
                        <span className={styles.return}>Обратно</span>
                      </div>
                    </div>
                    </div>
                    <div className={styles.tourActions}>
                      <button className={styles.viewTourBtn}>Посмотреть тур</button>
                      <button className={styles.downloadVoucherBtn}>Скачать ваучер</button>
                    </div>
                  </div>
                </div>

                <div className={styles.tourCard}>
                  <div className={styles.tourImage}>
                    <img src="/tour_2.png" alt="Мечеть в Мекке" />
                  </div>
                  <div className={styles.tourContent}>
                    <h3 className={styles.tourTitle}>3 дня в Медине · 3 дня в Мекке</h3>
                    <div className={styles.tourFeatures}>
                      <div className={styles.feature}>
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M10.9565 21.2053C16.5614 21.2053 21.202 16.5547 21.202 10.9598C21.202 5.35492 16.5514 0.714294 10.9464 0.714294C5.35156 0.714294 0.710938 5.35492 0.710938 10.9598C0.710938 16.5547 5.36161 21.2053 10.9565 21.2053Z" fill="white" />
  <path d="M9.8415 15.8717C9.50001 15.8717 9.21875 15.731 8.95759 15.3795L6.43638 12.2857C6.28572 12.0848 6.19531 11.8638 6.19531 11.6328C6.19531 11.1808 6.54688 10.8091 6.99888 10.8091C7.29018 10.8091 7.51116 10.8995 7.76227 11.231L9.80138 13.8627L14.0904 6.97209C14.2812 6.67075 14.5424 6.51004 14.8036 6.51004C15.2455 6.51004 15.6574 6.81138 15.6574 7.28347C15.6574 7.50446 15.5268 7.73549 15.4062 7.94642L10.6853 15.3795C10.4743 15.7109 10.1831 15.8717 9.8415 15.8717Z" fill="#253168" />
</svg>
                        <span>Всё включено</span>
                      </div>
                      <div className={styles.feature}>
                        <img src="/airplane.svg" alt="Прямой рейс" />
                        <span>Прямой рейс</span>
                      </div>
                    </div>
                    <div className={styles.hotelInfo}>
                      <div className={styles.hotel}>
                        <div className={styles.hotelImage}>
                          <img src="/mekka.svg" alt="Отель" />
                        </div>
                        <div className={styles.hotelContent}>
                        <span className={styles.hotelName}>5* отель в Мекке</span>
                        <span className={styles.distance}>Расстояние до Каабы 50 м.</span>
                        </div>
                        </div>
                      <div className={styles.hotel}>
                        <div className={styles.hotelImage}>
                          <img src="/medina.svg" alt="Медина" />
                        </div>
                        <div className={styles.hotelContent}>
                        <span className={styles.hotelName}>5* отель в Медине</span>
                        <span className={styles.distance}>Расстояние до мечети 150 м.</span>
                        </div>
                      </div>
                    </div>
                     <div className={styles.wrapper}>       
                    <div className={styles.tourPrice}>
                      <div className={styles.priceStatus}>Оплачено (1 чел)</div>
                      <div className={styles.priceAmount}>
                        <span className={styles.priceKzt}>1 312 500₸</span>
                        <span className={styles.priceUsd}>$2400</span>
                      </div>
                    </div>
                    <div className={styles.tourDates}>
                      <div className={styles.dateRange}>
                        <span className={styles.date}>12 авг</span>
                        <span className={styles.arrow}>→</span>
                        <span className={styles.date}>19 авг</span>
                      </div>
                      <div className={styles.dateLabels}>
                        <span className={styles.departure}>Вылет</span>
                        <span className={styles.return}>Обратно</span>
                      </div>
                    </div>
                    </div>
                    <div className={styles.tourActions}>
                      <button className={styles.viewTourBtn}>Посмотреть тур</button>
                      <button className={styles.downloadVoucherBtn}>Скачать ваучер</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "pending-payment" && (
              <div className={styles.leftColumn}>
                <div className={styles.tourCard}>
                  <div className={styles.tourImage}>
                    <img src="/tour_1.png" alt="Отель в Медине" />
                  </div>
                  <div className={styles.tourContent}>
                    <div className={styles.tourContents}>
                    <div className={styles.timerContainer}>
                      <div className={styles.timerBox}>
                        <span className={styles.timerText}>Оплатите до истечения брони</span>
                        <span className={styles.timer}>
                          {String(timer1.minutes).padStart(2, '0')}:{String(timer1.seconds).padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                    <h3 className={styles.tourTitle}>3 дня в Медине · 3 дня в Мекке</h3>
                    </div>
                    <div className={styles.tourFeatures}>
                      <div className={styles.feature}>
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10.9565 21.2053C16.5614 21.2053 21.202 16.5547 21.202 10.9598C21.202 5.35492 16.5514 0.714294 10.9464 0.714294C5.35156 0.714294 0.710938 5.35492 0.710938 10.9598C0.710938 16.5547 5.36161 21.2053 10.9565 21.2053Z" fill="white" />
                          <path d="M9.8415 15.8717C9.50001 15.8717 9.21875 15.731 8.95759 15.3795L6.43638 12.2857C6.28572 12.0848 6.19531 11.8638 6.19531 11.6328C6.19531 11.1808 6.54688 10.8091 6.99888 10.8091C7.29018 10.8091 7.51116 10.8995 7.76227 11.231L9.80138 13.8627L14.0904 6.97209C14.2812 6.67075 14.5424 6.51004 14.8036 6.51004C15.2455 6.51004 15.6574 6.81138 15.6574 7.28347C15.6574 7.50446 15.5268 7.73549 15.4062 7.94642L10.6853 15.3795C10.4743 15.7109 10.1831 15.8717 9.8415 15.8717Z" fill="#253168" />
                        </svg>
                        <span>Всё включено</span>
                      </div>
                      <div className={styles.feature}>
                        <img src="/airplane.svg" alt="Прямой рейс" />
                        <span>Прямой рейс</span>
                      </div>
                    </div>
                    <div className={styles.hotelInfo}>
                      <div className={styles.hotel}>
                        <div className={styles.hotelImage}>
                          <img src="/mekka.svg" alt="Отель" />
                        </div>
                        <div className={styles.hotelContent}>
                          <span className={styles.hotelName}>5* отель в Мекке</span>
                          <span className={styles.distance}>Расстояние до Каабы 50 м.</span>
                        </div>
                      </div>
                      <div className={styles.hotel}>
                        <div className={styles.hotelImage}>
                          <img src="/medina.svg" alt="Медина" />
                        </div>
                        <div className={styles.hotelContent}>
                          <span className={styles.hotelName}>5* отель в Медине</span>
                          <span className={styles.distance}>Расстояние до мечети 150 м.</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.wrapper}>
                      <div className={styles.tourPrice}>
                        <div className={styles.priceStatus}>Оплачено (1 чел)</div>
                        <div className={styles.priceAmount}>
                          <span className={styles.priceKzt}>1 312 500₸</span>
                          <span className={styles.priceUsd}>$2400</span>
                        </div>
                      </div>
                      <div className={styles.tourDates}>
                        <div className={styles.dateRange}>
                          <span className={styles.date}>24 авг</span>
                          <span className={styles.arrow}>→</span>
                          <span className={styles.date}>31 авг</span>
                        </div>
                        <div className={styles.dateLabels}>
                          <span className={styles.departure}>Вылет</span>
                          <span className={styles.return}>Обратно</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.tourActions}>
                      <button className={styles.payBtn}>Оплатить</button>
                    </div>
                  </div>
                </div>

                <div className={styles.tourCard}>
                  <div className={styles.tourImage}>
                    <img src="/tour_1.png" alt="Отель в Медине" />
                  </div>
                  <div className={styles.tourContent}>
                    <div className={styles.tourContents}>
                    <div className={styles.timerContainer}>
                      <div className={styles.timerBox}>
                        <span className={styles.timerText}>Оплатите до истечения брони</span>
                        <span className={styles.timer}>
                          {String(timer1.minutes).padStart(2, '0')}:{String(timer1.seconds).padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                    <h3 className={styles.tourTitle}>3 дня в Медине · 3 дня в Мекке</h3>
                    </div>
                    <div className={styles.tourFeatures}>
                      <div className={styles.feature}>
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10.9565 21.2053C16.5614 21.2053 21.202 16.5547 21.202 10.9598C21.202 5.35492 16.5514 0.714294 10.9464 0.714294C5.35156 0.714294 0.710938 5.35492 0.710938 10.9598C0.710938 16.5547 5.36161 21.2053 10.9565 21.2053Z" fill="white" />
                          <path d="M9.8415 15.8717C9.50001 15.8717 9.21875 15.731 8.95759 15.3795L6.43638 12.2857C6.28572 12.0848 6.19531 11.8638 6.19531 11.6328C6.19531 11.1808 6.54688 10.8091 6.99888 10.8091C7.29018 10.8091 7.51116 10.8995 7.76227 11.231L9.80138 13.8627L14.0904 6.97209C14.2812 6.67075 14.5424 6.51004 14.8036 6.51004C15.2455 6.51004 15.6574 6.81138 15.6574 7.28347C15.6574 7.50446 15.5268 7.73549 15.4062 7.94642L10.6853 15.3795C10.4743 15.7109 10.1831 15.8717 9.8415 15.8717Z" fill="#253168" />
                        </svg>
                        <span>Всё включено</span>
                      </div>
                      <div className={styles.feature}>
                        <img src="/airplane.svg" alt="Прямой рейс" />
                        <span>Прямой рейс</span>
                      </div>
                    </div>
                    <div className={styles.hotelInfo}>
                      <div className={styles.hotel}>
                        <div className={styles.hotelImage}>
                          <img src="/mekka.svg" alt="Отель" />
                        </div>
                        <div className={styles.hotelContent}>
                          <span className={styles.hotelName}>5* отель в Мекке</span>
                          <span className={styles.distance}>Расстояние до Каабы 50 м.</span>
                        </div>
                      </div>
                      <div className={styles.hotel}>
                        <div className={styles.hotelImage}>
                          <img src="/medina.svg" alt="Медина" />
                        </div>
                        <div className={styles.hotelContent}>
                          <span className={styles.hotelName}>5* отель в Медине</span>
                          <span className={styles.distance}>Расстояние до мечети 150 м.</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.wrapper}>
                      <div className={styles.tourPrice}>
                        <div className={styles.priceStatus}>Оплачено (1 чел)</div>
                        <div className={styles.priceAmount}>
                          <span className={styles.priceKzt}>1 312 500₸</span>
                          <span className={styles.priceUsd}>$2400</span>
                        </div>
                      </div>
                      <div className={styles.tourDates}>
                        <div className={styles.dateRange}>
                          <span className={styles.date}>24 авг</span>
                          <span className={styles.arrow}>→</span>
                          <span className={styles.date}>31 авг</span>
                        </div>
                        <div className={styles.dateLabels}>
                          <span className={styles.departure}>Вылет</span>
                          <span className={styles.return}>Обратно</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.tourActions}>
                      <button className={styles.payBtn}>Оплатить</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className={styles.rightColumn}>
              <div className={styles.supportSection}>
                <h3 className={styles.supportTitle}>Возникли проблемы?</h3>
                <div className={styles.contactInfo}>
                  <p>Свяжитесь с нами по номеру</p>
                  <a href="tel:+77777777777" className={styles.phoneNumber}>+7 777 777 77 77</a>
                  <p>или по почте:</p>
                  <a href="mailto:sample@gmail.com" className={styles.email}>sample@gmail.com</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
