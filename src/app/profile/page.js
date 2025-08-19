"use client";
 import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
 
import { useAuth } from "../../contexts/AuthContext";
import { getProfile, updateProfile, getMyBookings } from "../../lib/wordpress-api";
import HeaderProfile from "../components/HeaderProfile";
import Footer from "../components/Footer";
import BottomNavigation from "../components/BottomNavigation";
import styles from "./page.module.css";

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("tourist-data");
  const [timer1, setTimer1] = useState({ minutes: 19, seconds: 32 });
  const [timer2, setTimer2] = useState({ minutes: 15, seconds: 48 });
  const [profileLoading, setProfileLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [hasLoadedBookings, setHasLoadedBookings] = useState(false);
  const hasLoadedProfileRef = useRef(false);
  const [profileUpdated, setProfileUpdated] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    gender: "male",
    phone: "",
    iin: "",
    passportNumber: "",
    passportIssueDate: "",
    passportExpiryDate: ""
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("ru-RU");
    } catch {
      return dateStr;
    }
  };

  const handleDownloadVoucher = (booking) => {
    const norm = (v) => (v == null ? '' : String(v));
    const extractStrings = (val) => {
      const out = [];
      const visit = (v) => {
        if (v == null) return;
        if (typeof v === 'string') {
          const s = v.trim();
          if (s && !s.startsWith('http') && !s.endsWith('.svg') && !s.endsWith('.png')) out.push(s);
          return;
        }
        if (typeof v === 'number' || typeof v === 'boolean') { out.push(String(v)); return; }
        if (Array.isArray(v)) { v.forEach(visit); return; }
        if (typeof v === 'object') {
          const preferred = ['label','name','title','text','value','rendered','description','ru','kz','en'];
          for (const k of preferred) {
            if (v[k] != null) visit(v[k]);
          }
          Object.entries(v).forEach(([k, vv]) => {
            if (preferred.includes(k)) return;
            if (['icon','image','url','src'].includes(k)) return;
            visit(vv);
          });
        }
      };
      visit(val);
      return out;
    };
    const tourists = Array.isArray(booking.tour_data?.tourists) ? booking.tour_data.tourists : [];
    const features = [];

    const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8" />
    <title>Ваучер</title>
    <style>
      :root { --primary:#253168; --text:#111; --muted:#667085; --border:#E4E7EC; }
      * { box-sizing: border-box; }
      body { font-family: Arial, sans-serif; color:var(--text); padding:0; background:#fff; }
      .voucher { width:100%; margin:0; background:#fff; overflow:hidden; }
      .header { background:var(--primary); color:#fff; padding:18px 18px 12px; }
      .header h1 { margin:0; font-size:22px; font-weight:600; letter-spacing:0.2px; }
      .content { padding:24px 28px; }
      .grid { display:grid; grid-template-columns:1fr 1fr; gap:16px 24px; }
      .row { margin:6px 0; }
      .muted { color:var(--muted); }
      .badge { display:inline-block; padding:6px 10px; border-radius:999px; background:#f1f2f7; color:var(--primary); font-weight:600; font-size:12px; }
      .section { border:1px solid var(--border); border-radius:12px; padding:16px; margin:16px 0; }
      .section h2 { margin:0 0 10px; font-size:16px; font-weight:600; color:#0f172a; }
      .two { display:grid; grid-template-columns:1fr 1fr; gap:12px 20px; }
    </style></head><body>
      <div class="voucher">
        <div class="header"><h1>Atlas Tourism — Ваучер бронирования</h1></div>
        <div class="content">
          <div class="grid">
            <div class="row">Номер брони: <strong>${norm(booking.booking_id)}</strong></div>
            <div class="row">Статус: <span class="badge">${booking.status === 'paid' ? 'Оплачено' : 'Ожидает оплаты'}</span></div>
          </div>

      <div class="section">
        <h2>Данные тура</h2>
        <div class="two">
          <div>Тур: <strong>${norm(booking.tour_title || booking.tour_data?.name)}</strong></div>
          <div>Пакет: <span class="muted">${norm(booking.tour_data?.packageName || 'Турпакет')}</span></div>
          
          <div>Длительность: <span class="muted">${norm(booking.tour_data?.duration)}</span></div>
          <div>Даты: <span class="muted">${formatDate(booking.tour_data?.flightOutboundDate || booking.tour_data?.date)} — ${formatDate(booking.tour_data?.flightInboundDate || booking.tour_data?.endDate)}</span></div>
          ${booking.tour_data?.flightOutboundTime || booking.tour_data?.flightInboundTime ? `<div>Время вылета: <span class="muted">${norm(booking.tour_data?.flightOutboundTime)}</span></div><div>Время прилета: <span class="muted">${norm(booking.tour_data?.flightInboundTime)}</span></div>` : ''}
          ${booking.tour_data?.hotel_mekka || booking.tour_data?.hotel_medina ? `<div>Отель в Мекке: <span class="muted">${norm(booking.tour_data?.hotel_mekka)}</span></div><div>Отель в Медине: <span class="muted">${norm(booking.tour_data?.hotel_medina)}</span></div>` : ''}
          <div>Цена: <strong>$${norm(booking.tour_price)}</strong></div>
        </div>
      </div>

      <div class="section">
        <h2>Туристы</h2>
        ${tourists.map((t, idx) => `
          <div class="two">
            <div><strong>${idx+1}. ${norm(t.firstName)} ${norm(t.lastName)}</strong></div>
            <div>Тип: <span class="muted">${t.type === 'adult' ? 'Взрослый' : t.type === 'child' ? 'Ребенок' : 'Младенец'}</span></div>
            <div>Дата рождения: <span class="muted">${norm(t.birthDate)}</span></div>
            <div>Пол: <span class="muted">${t.gender === 'male' ? 'Мужской' : t.gender === 'female' ? 'Женский' : ''}</span></div>
            <div>ИИН: <span class="muted">${norm(t.iin)}</span></div>
            <div>Паспорт: <span class="muted">${norm(t.passportNumber)}</span></div>
            ${t.phone ? `<div>Телефон: <span class="muted">${norm(t.phone)}</span></div>` : ''}
          </div>
        `).join('')}
      </div>

      <div class="section">
        <h2>Условия</h2>
        <ul>
          <li>Ваучер подтверждает факт бронирования турпакета.</li>
          <li>Для вылета необходим действующий загранпаспорт и виза (если требуется).</li>
          <li>Подробности маршрута и отелей уточняйте у менеджера.</li>
        </ul>
      </div>
        </div>
      </div>
    </body></html>`;

    const w = window.open('', '_blank');
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => {
      try { w.print(); } catch (_) {}
    }, 300);
  };

  

  // Перенаправляем на главную если не авторизован (после маунта)
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  const loadProfile = useCallback(async () => {
    if (!user?.token) return;
    
    setProfileLoading(true);
    try {
      const result = await getProfile(user.token);
      if (result.success && result.profile) {
        const newFormData = {
          firstName: result.profile.first_name || "",
          lastName: result.profile.last_name || "",
          birthDate: result.profile.birth_date || "",
          gender: result.profile.gender || "male",
          phone: result.profile.phone || "",
          iin: result.profile.iin || "",
          passportNumber: result.profile.passport_number || "",
          passportIssueDate: result.profile.passport_issue_date || "",
          passportExpiryDate: result.profile.passport_expiry_date || ""
        };
        
        setFormData(newFormData);
      }
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
    } finally {
      setProfileLoading(false);
    }
  }, [user?.token]);

  const loadBookings = useCallback(async () => {
    if (!user?.token) return;
    
    setBookingsLoading(true);
    try {
      const result = await getMyBookings(user.token);
      if (result.success && result.bookings) {
        console.log('Загруженные бронирования:', result.bookings);
        setBookings(result.bookings);
      }
    } catch (error) {
      console.error('Ошибка загрузки бронирований:', error);
    } finally {
      setBookingsLoading(false);
    }
  }, [user?.token]);

  // Загружаем профиль пользователя (один раз за маунт)
  useEffect(() => {
    if (!isAuthenticated || !user?.token) return;
    if (hasLoadedProfileRef.current) return;
    hasLoadedProfileRef.current = true;
    loadProfile();
  }, [isAuthenticated, user?.token]);

  useEffect(() => {
    if (
      activeTab === 'booked-tours' &&
      isAuthenticated &&
      user?.token &&
      !bookingsLoading &&
      !hasLoadedBookings
    ) {
      loadBookings();
      setHasLoadedBookings(true);
    }
  }, [activeTab, isAuthenticated, user?.token, bookingsLoading, hasLoadedBookings]);

  useEffect(() => {
    if (activeTab !== 'pending-payment') return;
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
  }, [activeTab]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user?.token) return;
    
    setProfileLoading(true);
    try {
      const result = await updateProfile(user.token, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        birth_date: formData.birthDate,
        gender: formData.gender,
        iin: formData.iin,
        passport_number: formData.passportNumber,
        passport_issue_date: formData.passportIssueDate,
        passport_expiry_date: formData.passportExpiryDate
      });
      
      if (result.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Ошибка сохранения профиля:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  // Показываем загрузку пока проверяем авторизацию
  if (loading) {
    return <div>Загрузка...</div>;
  }

  // Перенаправляем если не авторизован
  if (!isAuthenticated) {
    return <div>Перенаправление...</div>;
  }

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
                   {profileUpdated && (
                     <div style={{ 
                       backgroundColor: '#e8f5e8', 
                       color: '#2d5a2d', 
                       padding: '12px', 
                       borderRadius: '8px', 
                       marginBottom: '20px',
                       fontSize: '14px'
                     }}>
                       ✅ Ваш профиль был автоматически обновлен данными первого туриста
                     </div>
                   )}
                  
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
                  <button 
                    onClick={handleSave}
                    disabled={profileLoading}
                  >
                    {profileLoading ? 'Сохранение...' : 'Сохранить'}
                  </button>
                  {saveSuccess && (
                    <div style={{ color: 'green', marginTop: '10px' }}>
                      Данные успешно сохранены!
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "booked-tours" && (
              <div className={styles.leftColumn}>
                {bookingsLoading ? (
                  <div className={styles.loading}>Загрузка бронирований...</div>
                ) : bookings.length === 0 ? (
                  <div className={styles.noBookings}>
                    <h3>У вас пока нет забронированных туров</h3>
                    <p>Забронируйте тур, чтобы он появился здесь</p>
                  </div>
                ) : (
                  bookings.map((booking) => (
                    <div key={booking.booking_id} className={styles.tourCard}>
                      <div className={styles.tourImage}>
                        <img 
                          src={booking.tour_image || "/tour_1.png"} 
                          alt={booking.tour_title || "Тур"} 
                        />
                      </div>
                      <div className={styles.tourContent}>
                        <h3 className={styles.tourTitle}>
                          {booking.tour_data?.duration || "Тур"}
                        </h3>
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
                              <span className={styles.hotelName}>
                                {booking.tour_data?.hotel_mekka || "Отель в Мекке"}
                              </span>
                              <span className={styles.distance}>
                                {booking.tour_data?.distance_mekka || "Расстояние до Каабы"}
                              </span>
                            </div>
                          </div>
                          <div className={styles.hotel}>
                            <div className={styles.hotelImage}>
                              <img src="/medina.svg" alt="Медина" />
                            </div>
                            <div className={styles.hotelContent}>
                              <span className={styles.hotelName}>
                                {booking.tour_data?.hotel_medina || "Отель в Медине"}
                              </span>
                              <span className={styles.distance}>
                                {booking.tour_data?.distance_medina || "Расстояние до мечети"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className={styles.wrapper}>
                          <div className={styles.tourPrice}>
                            <div className={styles.priceStatus}>
                              {booking.status === 'pending' ? 'Ожидает оплаты' : 'Оплачено'} 
                              ({booking.tour_data?.tourists?.length || 1} чел)
                            </div>
                            <div className={styles.priceAmount}>
                              <span className={styles.priceKzt}>
                                ~{Math.round(booking.tour_price * 547)}₸
                              </span>
                              <span className={styles.priceUsd}>
                                ${booking.tour_price}
                              </span>
                            </div>
                          </div>
                          <div className={styles.tourDates}>
                            <div className={styles.dateRange}>
                              <span className={styles.date}>
                                {booking.tour_data?.flightOutboundDate ? 
                                  new Date(booking.tour_data.flightOutboundDate).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }) : 
                                  'Дата вылета'
                                }
                              </span>
                              <span className={styles.arrow}>→</span>
                              <span className={styles.date}>
                                {booking.tour_data?.flightInboundDate ? 
                                  new Date(booking.tour_data.flightInboundDate).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }) : 
                                  'Дата возвращения'
                                }
                              </span>
                            </div>
                            <div className={styles.dateLabels}>
                              <span className={styles.departure}>Вылет</span>
                              <span className={styles.return}>Обратно</span>
                            </div>
                          </div>
                        </div>
                        <div className={styles.tourActions}>
                          <button 
                            className={styles.viewTourBtn}
                            onClick={() => router.push(`/tour/${booking.tour_slug}`)}
                          >
                            Посмотреть тур
                          </button>
                          <button className={styles.downloadVoucherBtn} onClick={() => handleDownloadVoucher(booking)}>
                            Скачать ваучер
                          </button>
                        </div>
                        
                        {/* Информация о туристах */}
                        {booking.tour_data?.tourists && booking.tour_data.tourists.length > 0 && (
                          <div className={styles.touristsInfo}>
                            <h4>Туристы:</h4>
                            {booking.tour_data.tourists.map((tourist, index) => (
                              <div key={index} className={styles.touristInfo}>
                                <strong>{index + 1}. {tourist.firstName} {tourist.lastName}</strong>
                                <div>Тип: {tourist.type === 'adult' ? 'Взрослый' : tourist.type === 'child' ? 'Ребенок' : 'Младенец'}</div>
                                <div>Дата рождения: {tourist.birthDate}</div>
                                <div>Пол: {tourist.gender === 'male' ? 'Мужской' : 'Женский'}</div>
                                <div>ИИН: {tourist.iin}</div>
                                <div>Паспорт: {tourist.passportNumber}</div>
                                {tourist.phone && <div>Телефон: {tourist.phone}</div>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
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
      <BottomNavigation />
    </div>
  );
}
