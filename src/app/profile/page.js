"use client";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
 
import { useAuth } from "../../contexts/AuthContext";
import { getProfile, updateProfile, getMyBookings } from "../../lib/wordpress-api";
import HeaderProfile from "../components/HeaderProfile";
import Footer from "../components/Footer";
import BottomNavigation from "../components/BottomNavigation";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

if (pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
} else if (pdfFonts.vfs) {
  pdfMake.vfs = pdfFonts.vfs;
}
import styles from "./page.module.css";

function ProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("tourist-data");
  const [bookingTimers, setBookingTimers] = useState({});
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

  // Синхронизация таба с URL
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['tourist-data', 'bookings', 'pending-payment'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Прокрутка к якорю при загрузке
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    }
  }, [bookings, activeTab]);

  // Обновление таймеров каждую секунду
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers = {};
      bookings.forEach((booking) => {
        if (booking.status === 'pending') {
          const timeRemaining = calculateTimeRemaining(booking.booking_date || booking.bookingDate);
          newTimers[booking.booking_id] = timeRemaining;
        }
      });
      setBookingTimers(newTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [bookings]);

  // Функция для переключения таба
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const url = new URL(window.location);
    url.searchParams.set('tab', tab);
    router.replace(url.pathname + url.search);
  };

  // Функция для расчета времени до истечения брони
  const calculateTimeRemaining = (bookingDate) => {
    const bookingTime = new Date(bookingDate);
    const expirationTime = new Date(bookingTime.getTime() + 20 * 60 * 1000); // 20 минут
    const now = new Date();
    const timeRemaining = expirationTime.getTime() - now.getTime();
    
    
    if (timeRemaining <= 0) {
      return { minutes: 0, seconds: 0, expired: true };
    }
    
    const minutes = Math.floor(timeRemaining / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
    
    return { minutes, seconds, expired: false };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("ru-RU");
    } catch {
      return dateStr;
    }
  };

  // Универсальная функция для получения информации об отелях
  const getHotelInfo = (booking, city) => {
    const tourData = booking.tour_data;
    
    console.log(`=== ПОИСК ДАННЫХ ОТЕЛЯ ${city.toUpperCase()} ===`);
    console.log('tourData:', tourData);
    console.log('hotels:', tourData?.hotels);
    console.log(`hotel_${city}:`, tourData?.[`hotel_${city}`]);
    console.log('hotels_info:', tourData?.hotels_info);
    
    let hotelName = '';
    let distanceText = '';
    let distanceNumber = '';
    let hasData = false;

    if (city === 'mekka') {
      // Пробуем объект hotels.mekka (приоритет)
      if (tourData?.hotels?.mekka && typeof tourData.hotels.mekka === 'object') {
        const hotelData = tourData.hotels.mekka;
        hotelName = hotelData.hotel_text || hotelData.short_name || hotelData.name || '5★ отель в Мекке';
        distanceText = hotelData.distance_text || 'до Каабы';
        distanceNumber = hotelData.distance_number || '';
        hasData = true;
      }
      // Пробуем строку hotel_mekka
      else if (tourData?.hotel_mekka && typeof tourData.hotel_mekka === 'string') {
        hotelName = tourData.hotel_mekka;
        distanceText = 'до Каабы';
        hasData = true;
      }
      // Пробуем объект hotel_mekka
      else if (tourData?.hotel_mekka && typeof tourData.hotel_mekka === 'object') {
        const hotelData = tourData.hotel_mekka;
        hotelName = hotelData.hotel_text || hotelData.short_name || hotelData.name || '5★ отель в Мекке';
        distanceText = hotelData.distance_text || 'до Каабы';
        distanceNumber = hotelData.distance_number || '';
        hasData = true;
      }
      // Пробуем hotels_info
      else if (Array.isArray(tourData?.hotels_info)) {
        const mekkaHotel = tourData.hotels_info.find(h => h.city === 'mekka');
        if (mekkaHotel) {
          hotelName = mekkaHotel.hotel_text || mekkaHotel.name || '5★ отель в Мекке';
          distanceText = mekkaHotel.distance_text || 'до Каабы';
          distanceNumber = mekkaHotel.distance_number || '';
          hasData = true;
        }
      }
      
      // Fallback
      if (!hasData) {
        hotelName = '5★ отель в Мекке';
        distanceText = 'до Каабы';
      }
    } else if (city === 'medina') {
      // Пробуем объект hotels.medina (приоритет)
      if (tourData?.hotels?.medina && typeof tourData.hotels.medina === 'object') {
        const hotelData = tourData.hotels.medina;
        hotelName = hotelData.hotel_text || hotelData.short_name || hotelData.name || '5★ отель в Медине';
        distanceText = hotelData.distance_text || 'до мечети Пророка';
        distanceNumber = hotelData.distance_number || '';
        hasData = true;
      }
      // Пробуем строку hotel_medina
      else if (tourData?.hotel_medina && typeof tourData.hotel_medina === 'string') {
        hotelName = tourData.hotel_medina;
        distanceText = 'до мечети Пророка';
        hasData = true;
      }
      // Пробуем объект hotel_medina
      else if (tourData?.hotel_medina && typeof tourData.hotel_medina === 'object') {
        const hotelData = tourData.hotel_medina;
        hotelName = hotelData.hotel_text || hotelData.short_name || hotelData.name || '5★ отель в Медине';
        distanceText = hotelData.distance_text || 'до мечети Пророка';
        distanceNumber = hotelData.distance_number || '';
        hasData = true;
      }
      // Пробуем hotels_info
      else if (Array.isArray(tourData?.hotels_info)) {
        const medinaHotel = tourData.hotels_info.find(h => h.city === 'medina');
        if (medinaHotel) {
          hotelName = medinaHotel.hotel_text || medinaHotel.name || '5★ отель в Медине';
          distanceText = medinaHotel.distance_text || 'до мечети Пророка';
          distanceNumber = medinaHotel.distance_number || '';
          hasData = true;
        }
      }
      
      // Fallback
      if (!hasData) {
        hotelName = '5★ отель в Медине';
        distanceText = 'до мечети Пророка';
      }
    }

    const result = {
      name: hotelName,
      distanceText: distanceText,
      distanceNumber: distanceNumber,
      hasData: hasData
    };
    
    console.log(`=== РЕЗУЛЬТАТ ПОИСКА ОТЕЛЯ ${city.toUpperCase()} ===`);
    console.log('Результат:', result);
    
    return result;
  };

  const handleDownloadVoucher = async (booking) => {
    console.log('=== ДАННЫЕ БРОНИРОВАНИЯ ===');
    console.log('Полные данные бронирования:', booking);
    console.log('=== ДАННЫЕ ТУРА ===');
    console.log('Данные тура:', booking.tour_data);
    console.log('Тип рейса:', booking.tour_data?.flight_type);
    console.log('Рейс туда:', booking.tour_data?.flight_outbound);
    console.log('Рейс обратно:', booking.tour_data?.flight_inbound);
    console.log('Рейс с пересадкой туда:', booking.tour_data?.flight_outbound_connecting);
    console.log('Пересадка:', booking.tour_data?.flight_connecting);
    console.log('Рейс с пересадкой обратно:', booking.tour_data?.flight_inbound_connecting);
    console.log('Услуги тура:', booking.tour_data?.services);
    console.log('Трансферы тура:', booking.tour_data?.transfers);
    console.log('=== ДАННЫЕ ОТЕЛЕЙ ===');
    console.log('Отель Мекка:', booking.tour_data?.hotel_mekka);
    console.log('Отель Медина:', booking.tour_data?.hotel_medina);
    console.log('Отели (старая структура):', booking.tour_data?.hotels);
    console.log('Информация об отелях:', booking.tour_data?.hotels_info);
    
    const norm = (v) => (v == null ? '' : String(v));
    const tourists = Array.isArray(booking.tour_data?.tourists) ? booking.tour_data.tourists : [];
    
    // Функция для преобразования ключа типа трансфера в читаемое название
    const getTransferTypeName = (type) => {
      const transferTypes = {
        'bus_train': 'BUS + TRAIN',
        'bus_full': 'BUS FULL',
        'gmc_train': 'GMC + TRAIN', 
        'gmc_full': 'GMC FULL'
      };
      return transferTypes[type] || type;
    };

    // Конвертируем SVG в PNG через Canvas
    let logoBase64 = '';
    let qrBase64 = '';
    
    // Загружаем QR-код
    try {
      const response = await fetch('/qr.jpg');
      const blob = await response.blob();
      const reader = new FileReader();
      qrBase64 = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.log('Не удалось загрузить QR-код:', error);
    }
    
    try {
      const svgCode = `<svg width="406" height="158" viewBox="0 0 406 158" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M381.598 82.0682C371.656 82.0682 366.414 77.3683 363.341 73.9338C360.449 70.4992 359.003 67.4262 358.46 65.4378L357.918 63.8109L365.329 60.3763L365.872 62.184C366.775 64.8955 368.583 67.4262 369.487 68.6916C372.198 72.1261 376.898 74.2953 381.779 74.2953C390.637 74.2953 397.506 67.7877 397.506 59.2917C397.506 55.1341 395.517 51.8803 391.179 49.3496C389.19 48.265 385.033 46.0958 379.068 43.2036C372.018 39.769 367.86 37.5998 365.149 32.8999C363.341 30.0077 362.618 27.1154 362.618 23.6809C362.618 13.9195 369.487 3.79663 382.864 3.79663C391.179 3.79663 398.229 7.95424 402.206 15.1849L402.748 16.4502L396.421 21.6924L395.517 19.704C391.902 12.8349 385.937 11.7503 382.864 11.7503C374.729 11.7503 371.114 17.7156 371.114 23.5001C371.114 29.8269 375.091 31.9961 382.683 35.7922C382.683 35.7922 385.394 37.0575 386.479 37.5998C391.36 39.9498 394.433 41.3959 397.506 43.5651C401.121 46.0958 406.002 50.4342 406.002 59.111C406.002 72.1261 395.336 82.0682 381.598 82.0682Z" fill="black"/>
<path d="M62.9065 81.5253L35.9724 19.8842L8.85753 81.5253H0L35.9724 -6.10352e-05L71.9448 81.5253H62.9065Z" fill="black"/>
<path d="M318.509 81.5256L291.575 19.8845L264.46 81.5256H255.422L291.575 0.000244141L327.547 81.5256H318.509Z" fill="black"/>
<path d="M112.984 81.1639V13.0152H94.0039V5.06152H140.099V13.0152H121.3V81.1639H112.984Z" fill="black"/>
<path d="M182.398 80.8028V4.70038H190.894V73.0299H225.24L221.986 80.8028H182.398Z" fill="black"/>
<path d="M226.506 154.555L227.59 154.013C228.494 153.651 229.759 151.663 229.759 149.674V134.309H227.048V130.152H234.64V149.494C234.64 154.013 231.386 156.363 229.217 156.905H228.675L226.506 154.555ZM258.14 154.555L259.224 154.193C260.128 153.651 261.393 151.844 261.393 149.855V134.49H258.682V130.332H266.093V149.674C266.093 154.013 263.02 156.363 260.851 156.905L260.309 157.086L258.14 154.555ZM201.921 152.747L200.656 150.036H188.726L187.46 152.747H182.58L192.883 130.152H196.679L206.983 152.747H201.921ZM198.848 145.878L194.872 136.84L190.714 145.878H198.848ZM155.284 152.747V143.709H143.353V152.747H138.473V130.152H143.353V139.19H155.284V130.152H160.165V152.747H155.284Z" fill="black"/>
<path d="M42.6618 81.7061L35.9735 96.7096L29.2852 81.7061L35.9735 66.5217L42.6618 81.7061Z" fill="#253168"/>
</svg>`;
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      // Увеличиваем разрешение в 2 раза для лучшего качества
      const scale = 2;
      canvas.width = 406 * scale;
      canvas.height = 158 * scale;
      
      // Включаем сглаживание
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      const img = new Image();
      const svgBlob = new Blob([svgCode], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      
      logoBase64 = await new Promise((resolve) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          const pngData = canvas.toDataURL('image/png');
          URL.revokeObjectURL(url);
          resolve(pngData);
        };
        img.src = url;
      });
    } catch (error) {
      console.log('Не удалось конвертировать SVG:', error);
    }

    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [20, 20, 20, 20],
      content: [
        {
          columns: [
            {
              width: 200,
              image: logoBase64 || 'ATLAS HAJJ',
              fit: [200, 80],
              alignment: 'left'
            },
            {
              width: '*',
              text: [
                { text: '№ ваучера: ', bold: true, fontSize: 10, color: '#333' },
                { text: `U${String(booking.booking_id).padStart(6, '0')}`, bold: true, fontSize: 10, color: '#253168' },
                { text: '\nТуроператор: ', bold: true, fontSize: 10, color: '#333' },
                { text: 'ATLAS TOURISM LLP', bold: true, fontSize: 10, color: '#253168' },
                { text: '\nДата ваучера: ', bold: true, fontSize: 10, color: '#333' },
                { text: new Date().toLocaleDateString('ru-RU'), bold: true, fontSize: 10, color: '#253168' }
              ],
              alignment: 'right'
            }
          ]
        },
        { text: '', margin: [0, 2] },
        {
          text: 'Список туристов',
          style: 'sectionHeader',
          margin: [0, 0, 0, 4]
        },
        {
          table: {
            widths: ['*', '*', '*', '*', '*', '*'],
            body: [
              [
                { text: 'ФИО', bold: true, fillColor: '#f5f5f5' },
                { text: 'Дата рождения', bold: true, fillColor: '#f5f5f5' },
                { text: '№ паспорта', bold: true, fillColor: '#f5f5f5' },
                { text: 'Номер телефона', bold: true, fillColor: '#f5f5f5' },
                { text: '', fillColor: '#f5f5f5' },
                { text: '', fillColor: '#f5f5f5' }
              ],
              ...tourists.map(t => [
                { text: `${norm(t.firstName)} ${norm(t.lastName)}` },
                { text: norm(t.birthDate) },
                { text: norm(t.passportNumber) },
                { text: norm(t.phone || '') },
                { text: '' },
                { text: '' }
              ])
            ]
          },
          layout: 'noBorders',
        },
        { text: '', margin: [0, 2] },
        {
          text: 'Детали перелета',
          style: 'sectionHeader',
          margin: [0, 0, 0, 4]
        },
        ...(booking.tour_data?.flight_type === 'direct' ? [
          {
            table: {
              widths: ['*', '*', '*', '*', '*', '*'],
              body: [
                [
                  { text: 'Авиалиния', bold: true, fillColor: '#f5f5f5' },
                  { text: '№ рейса', bold: true, fillColor: '#f5f5f5' },
                  { text: 'Дата вылета', bold: true, fillColor: '#f5f5f5' },
                  { text: 'Время вылета', bold: true, fillColor: '#f5f5f5' },
                  { text: 'Время прилета', bold: true, fillColor: '#f5f5f5' },
                  { text: '', fillColor: '#f5f5f5' }
                ],
                [
                  { text: norm(booking.tour_data?.flight_outbound?.airline) || 'Air Astana' },
                  { text: norm(booking.tour_data?.flight_outbound?.number) || 'НД' },
                  { text: booking.tour_data?.flight_outbound?.departure_date || formatDate(booking.tour_data?.tour_dates?.[0]?.date_start || booking.tour_data?.flightOutboundDate || booking.tour_data?.date) },
                  { text: norm(booking.tour_data?.flight_outbound?.departure_time) || 'НД' },
                  { text: norm(booking.tour_data?.flight_outbound?.arrival_time) || 'НД' },
                  { text: '' }
                ],
                [
                  { text: norm(booking.tour_data?.flight_inbound?.airline) || 'Air Astana' },
                  { text: norm(booking.tour_data?.flight_inbound?.number) || 'НД' },
                  { text: booking.tour_data?.flight_inbound?.departure_date || formatDate(booking.tour_data?.tour_dates?.[0]?.date_end || booking.tour_data?.flightInboundDate || booking.tour_data?.endDate) },
                  { text: norm(booking.tour_data?.flight_inbound?.departure_time) || 'НД' },
                  { text: norm(booking.tour_data?.flight_inbound?.arrival_time) || 'НД' },
                  { text: '' }
                ]
              ]
            },
            layout: 'noBorders'
          }
        ] : booking.tour_data?.flight_type === 'connecting' ? [
          {
            table: {
              widths: ['*', '*', '*', '*', '*', '*'],
              body: [
                [
                  { text: 'Авиалиния', bold: true, fillColor: '#f5f5f5' },
                  { text: '№ рейса', bold: true, fillColor: '#f5f5f5' },
                  { text: 'Дата вылета', bold: true, fillColor: '#f5f5f5' },
                  { text: 'Время вылета', bold: true, fillColor: '#f5f5f5' },
                  { text: 'Время прилета', bold: true, fillColor: '#f5f5f5' },
                  { text: 'Пересадка', bold: true }
                ],
                [
                  { text: norm(booking.tour_data?.flight_outbound_connecting?.airline) || 'Air Astana' },
                  { text: norm(booking.tour_data?.flight_outbound_connecting?.number) || 'НД' },
                  { text: booking.tour_data?.flight_outbound_connecting?.departure_date || formatDate(booking.tour_data?.tour_dates?.[0]?.date_start || booking.tour_data?.flightOutboundDate || booking.tour_data?.date) },
                  { text: norm(booking.tour_data?.flight_outbound_connecting?.departure_time) || 'НД' },
                  { text: norm(booking.tour_data?.flight_outbound_connecting?.arrival_time) || 'НД' },
                  { text: norm(booking.tour_data?.flight_connecting?.connecting_airport) || 'НД' }
                ],
                [
                  { text: 'Пересадка', bold: true, fillColor: '#e8f4fd', style: 'connectingCell' },
                  { text: 'Ожидание', bold: true, fillColor: '#e8f4fd', style: 'connectingCell' },
                  { text: booking.tour_data?.flight_connecting?.connecting_airport || 'НД', fillColor: '#e8f4fd', style: 'connectingCell' },
                  { text: booking.tour_data?.flight_connecting?.connecting_wait_time || 'НД', fillColor: '#e8f4fd', style: 'connectingCell' },
                  { text: '', fillColor: '#e8f4fd' },
                  { text: '', fillColor: '#e8f4fd' }
                ],
                [
                  { text: norm(booking.tour_data?.flight_connecting?.airline) || 'Air Astana' },
                  { text: norm(booking.tour_data?.flight_connecting?.number) || 'НД' },
                  { text: booking.tour_data?.flight_connecting?.departure_date || 'НД' },
                  { text: norm(booking.tour_data?.flight_connecting?.departure_time) || 'НД' },
                  { text: norm(booking.tour_data?.flight_connecting?.arrival_time) || 'НД' },
                  { text: 'Медина', bold: true }
                ],
                [
                  { text: norm(booking.tour_data?.flight_inbound_connecting?.airline) || 'Air Astana' },
                  { text: norm(booking.tour_data?.flight_inbound_connecting?.number) || 'НД' },
                  { text: booking.tour_data?.flight_inbound_connecting?.departure_date || formatDate(booking.tour_data?.tour_dates?.[0]?.date_end || booking.tour_data?.flightInboundDate || booking.tour_data?.endDate) },
                  { text: norm(booking.tour_data?.flight_inbound_connecting?.departure_time) || 'НД' },
                  { text: norm(booking.tour_data?.flight_inbound_connecting?.arrival_time) || 'НД' },
                  { text: 'Обратно', bold: true }
                ]
              ]
            },
            layout: 'noBorders'
          }
        ] : [
          {
            table: {
              widths: ['*', '*', '*', '*', '*', '*'],
              body: [
                [
                  { text: 'Авиалиния', bold: true, fillColor: '#f5f5f5' },
                  { text: '№ рейса', bold: true, fillColor: '#f5f5f5' },
                  { text: 'Дата вылета', bold: true, fillColor: '#f5f5f5' },
                  { text: 'Время вылета', bold: true, fillColor: '#f5f5f5' },
                  { text: 'Время прилета', bold: true, fillColor: '#f5f5f5' },
                  { text: '', fillColor: '#f5f5f5' }
                ],
                [
                  { text: 'НД' },
                  { text: 'НД' },
                  { text: 'НД' },
                  { text: 'НД' },
                  { text: 'НД' },
                  { text: '' }
                ]
              ]
            },
            layout: 'noBorders'
          }
        ]),
        { text: '', margin: [0, 2] },
        {
          text: 'Детали проживания',
          style: 'sectionHeader',
          margin: [0, 0, 0, 4]
        },
        {
          table: {
            widths: ['*', '*', '*', '*', '*', '*'],
            body: [
              [
                { text: 'Отель в Медине', bold: true, fillColor: '#f5f5f5' },
                { text: '', fillColor: '#f5f5f5' },
                { text: '', fillColor: '#f5f5f5' },
                { text: 'Отель в Мекке', bold: true, fillColor: '#f5f5f5' },
                { text: '', fillColor: '#f5f5f5' },
                { text: '', fillColor: '#f5f5f5' }
              ],
              [
                { text: norm(booking.tour_data?.hotels?.medina?.hotel_text) || norm(booking.tour_data?.hotels?.medina?.short_name) || norm(booking.tour_data?.hotel_medina) || 'НД' },
                { text: '' },
                { text: '' },
                { text: norm(booking.tour_data?.hotels?.mekka?.hotel_text) || norm(booking.tour_data?.hotels?.mekka?.short_name) || norm(booking.tour_data?.hotel_mekka) || 'НД' },
                { text: '' },
                { text: '' }
              ],
              [
                { text: 'Заезд', bold: true, fillColor: '#f5f5f5' },
                { text: 'Выезд', bold: true, fillColor: '#f5f5f5' },
                { text: '', fillColor: '#f5f5f5' },
                { text: 'Заезд', bold: true, fillColor: '#f5f5f5' },
                { text: 'Выезд', bold: true, fillColor: '#f5f5f5' },
                { text: '', fillColor: '#f5f5f5' }
              ],
              [
                { text: booking.tour_data?.hotels?.medina?.check_in ? new Date(booking.tour_data.hotels.medina.check_in).toLocaleDateString('ru-RU') : 'НД' },
                { text: booking.tour_data?.hotels?.medina?.check_out ? new Date(booking.tour_data.hotels.medina.check_out).toLocaleDateString('ru-RU') : 'НД' },
                { text: '' },
                { text: booking.tour_data?.hotels?.mekka?.check_in ? new Date(booking.tour_data.hotels.mekka.check_in).toLocaleDateString('ru-RU') : 'НД' },
                { text: booking.tour_data?.hotels?.mekka?.check_out ? new Date(booking.tour_data.hotels.mekka.check_out).toLocaleDateString('ru-RU') : 'НД' },
                { text: '' }
              ],
              [
                { text: 'Тип номера', bold: true, fillColor: '#f5f5f5' },
                { text: 'Тип размещения', bold: true, fillColor: '#f5f5f5' },
                { text: '', fillColor: '#f5f5f5' },
                { text: 'Тип номера', bold: true, fillColor: '#f5f5f5' },
                { text: 'Тип размещения', bold: true, fillColor: '#f5f5f5' },
                { text: '', fillColor: '#f5f5f5' }
              ],
              [
                { text: norm(booking.tour_data?.hotels?.medina?.room_type) || 'НД' },
                { text: norm(booking.tour_data?.roomType?.toUpperCase()) || 'НД' },
                { text: '' },
                { text: norm(booking.tour_data?.hotels?.mekka?.room_type) || 'НД' },
                { text: norm(booking.tour_data?.roomType?.toUpperCase()) || 'НД' },
                { text: '' }
              ],
              [
                { text: 'Питание', bold: true, fillColor: '#f5f5f5' },
                { text: '', fillColor: '#f5f5f5' },
                { text: '', fillColor: '#f5f5f5' },
                { text: 'Питание', bold: true, fillColor: '#f5f5f5' },
                { text: '', fillColor: '#f5f5f5' },
                { text: '', fillColor: '#f5f5f5' }
              ],
              [
                { text: norm(booking.tour_data?.hotels?.medina?.meal_plan) || 'НД' },
                { text: '' },
                { text: '' },
                { text: norm(booking.tour_data?.hotels?.mekka?.meal_plan) || 'НД' },
                { text: '' },
                { text: '' }
              ]
            ]
          },
          layout: 'noBorders'
        },
        { text: '', margin: [0, 2] },
        {
          text: 'Трансфер и сервис',
          style: 'sectionHeader',
          margin: [0, 0, 0, 4]
        },
        {
          table: {
            widths: ['*', '*', '*', '*', '*', '*'],
            body: [
              [
                { text: 'Трансфер', bold: true, fillColor: '#f5f5f5' },
                { text: 'Хадж-набор', bold: true, fillColor: '#f5f5f5' },
                { text: 'Экскурсия', bold: true, fillColor: '#f5f5f5' },
                { text: 'Виза и медстраховка', bold: true, fillColor: '#f5f5f5' },
                { text: 'Услуги гида', bold: true, fillColor: '#f5f5f5' },
                { text: 'Поддержка', bold: true, fillColor: '#f5f5f5' }
              ],
              [
                { text: getTransferTypeName(booking.tour_data?.transfer_type) || 'BUS + TRAIN' },
                { text: booking.tour_data?.services?.includes('hajj_kit') ? 'ВКЛ' : 'НЕТ', bold: true, color: booking.tour_data?.services?.includes('hajj_kit') ? '#253168' : '#999' },
                { text: booking.tour_data?.services?.includes('excursion') ? 'ВКЛ' : 'НЕТ', bold: true, color: booking.tour_data?.services?.includes('excursion') ? '#253168' : '#999' },
                { text: booking.tour_data?.services?.includes('visa_insurance') ? 'ВКЛ' : 'НЕТ', bold: true, color: booking.tour_data?.services?.includes('visa_insurance') ? '#253168' : '#999' },
                { text: booking.tour_data?.services?.includes('guide_services') ? 'ВКЛ' : 'НЕТ', bold: true, color: booking.tour_data?.services?.includes('guide_services') ? '#253168' : '#999' },
                { text: booking.tour_data?.services?.includes('support') ? 'ВКЛ' : 'НЕТ', bold: true, color: booking.tour_data?.services?.includes('support') ? '#253168' : '#999' }
              ]
            ]
          },
          layout: 'noBorders',
        },
        { text: '', margin: [0, 2] },
        {
          columns: [
            {
              width: '*',
              text: [
                { text: 'Важная информация', style: 'sectionHeader' },
                { text: '\n\nПожалуйста, прибывайте в аэропорт за 4 часа до вылета. Наш гид встретит вас и организует сбор группы, сопровождая на всех этапах — от сдачи багажа до прохождения паспортного контроля.\n\nДля въезда в Саудовскую Аравию необходим действующий загранпаспорт и туристическая виза. Медицинская страховка включена и покрывает базовые расходы. При желании вы можете оформить расширенное страховое покрытие.\n\nХадж-набор будет выдан в аэропорту. Пожалуйста, сохраняйте все материалы и документы до конца поездки. Гид будет рядом и поможет с любыми вопросами.\n\nЭкскурсии к святым местам включены. Расписание может корректироваться с учётом безопасности. Трансфер предоставляется на всём маршруте. Проживание организовано с питанием (завтрак и ужин). Дополнительные напитки и блюда оплачиваются отдельно.\n\nЕсли у вас возникнут вопросы — напишите нам в WhatsApp.\n\nЖелаем вам спокойного и благополучного паломничества!' }
              ]
            },
            {
              width: '*',
              stack: [
                { text: 'Контактная информация', style: 'sectionHeader' },
                { text: '\nЕсли у вас возникли вопросы или трудности — отсканируйте QR-код ниже.\n' },
                {
                  image: qrBase64 || 'QR-код недоступен',
                  width: 100,
                  alignment: 'left',
                  margin: [0, 8, 0, 8]
                },
                { text: 'Если QR-код не работает, свяжитесь с нами по WhatsApp: +7 702 151 0000' }
              ]
            }
          ]
        }
      ],
      styles: {
        headerLabel: {
          fontSize: 14,
          bold: true,
          color: '#333'
        },
        headerValue: {
          fontSize: 14,
          bold: true,
          color: '#253168'
        },
        sectionHeader: {
          fontSize: 14,
          bold: true,
          margin: [0, 5, 0, 2]
        },
        tableHeader: {
          fontSize: 11,
          bold: true,
          color: '#333',
          margin: [4, 3, 4, 3]
        },
        tableCell: {
          fontSize: 8,
          margin: [4, 3, 4, 3]
        },
        connectingCell: {
          fontSize: 10,
          color: '#253168',
          bold: true,
          margin: [4, 3, 4, 3]
        }
      },
      defaultStyle: {
        fontSize: 10,
        font: 'Roboto'
      }
    };

    pdfMake.createPdf(docDefinition).download(`voucher-${norm(booking.booking_id)}.pdf`);
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
        // Логируем структуру данных первого бронирования для отладки
        if (result.bookings.length > 0) {
          console.log('=== СТРУКТУРА ДАННЫХ БРОНИРОВАНИЯ ===');
          console.log('Первое бронирование:', result.bookings[0]);
          console.log('Данные тура:', result.bookings[0].tour_data);
          console.log('Отели в tour_data:', {
            hotel_mekka: result.bookings[0].tour_data?.hotel_mekka,
            hotel_medina: result.bookings[0].tour_data?.hotel_medina,
            hotels: result.bookings[0].tour_data?.hotels,
            hotels_info: result.bookings[0].tour_data?.hotels_info
          });
        }
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
      (activeTab === 'bookings' || activeTab === 'pending-payment') &&
      isAuthenticated &&
      user?.token &&
      !bookingsLoading &&
      !hasLoadedBookings
    ) {
      loadBookings();
      setHasLoadedBookings(true);
    }
  }, [activeTab, isAuthenticated, user?.token, bookingsLoading, hasLoadedBookings]);


  const handleInputChange = (field, value) => {
    if (field === "passportNumber") {
      value = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    } else if (field === "firstName" || field === "lastName") {
      value = value.toUpperCase().replace(/[^A-Z]/g, '');
    } else if (field === "iin") {
      value = value.replace(/[^0-9]/g, '');
    } else if (field === "phone") {
      value = value.replace(/[^0-9+]/g, '');
    }
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
    return <div>Подготовка к полету...</div>;
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
              onClick={() => handleTabChange("tourist-data")}
            >
              Данные туриста
            </button>
            <button 
              className={`${styles.tab} ${activeTab === "bookings" ? styles.active : ""}`}
              onClick={() => handleTabChange("bookings")}
            >
              Забронированные туры
            </button>
            <button 
              className={`${styles.tab} ${activeTab === "pending-payment" ? styles.active : ""}`}
              onClick={() => handleTabChange("pending-payment")}
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
                        placeholder="Только английские заглавные буквы"
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
                        placeholder="Только английские заглавные буквы"
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
                        placeholder="Только цифры и знак +"
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
                          placeholder="Только английские заглавные буквы и цифры"
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
                        placeholder="Только цифры"
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

            {activeTab === "bookings" && (
              <div className={styles.leftColumn}>
                {bookingsLoading ? (
                  <div className={styles.loading}>Собираем ваши путешествия...</div>
                ) : bookings.length === 0 ? (
                  <div className={styles.noBookings}>
                    <h3 className={styles.textEx}>У вас пока нет забронированных туров</h3>
                    <p className={styles.textEx}>Забронируйте тур, чтобы он появился здесь</p>
                  </div>
                ) : (
                  bookings.map((booking) => (
                    <div key={booking.booking_id} id={`booking-${booking.booking_id}`} className={styles.tourCard}>
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
                        {(() => {
                          const mekkaInfo = getHotelInfo(booking, 'mekka');
                          return mekkaInfo.hasData && (
                            <div className={styles.hotel}>
                              <div className={styles.hotelImage}>
                                <img src="/mekka.svg" alt="Отель" />
                              </div>
                              <div className={styles.hotelContent}>
                                <span className={styles.hotelName}>
                                  {mekkaInfo.name}
                                </span>
                                <span className={styles.distance}>
                                  {mekkaInfo.distanceText}{' '}
                                  {mekkaInfo.distanceNumber ? `${mekkaInfo.distanceNumber} м.` : ''}
                                </span>
                              </div>
                            </div>
                          );
                        })()}
{(() => {
                          const medinaInfo = getHotelInfo(booking, 'medina');
                          return medinaInfo.hasData && (
                            <div className={styles.hotel}>
                              <div className={styles.hotelImage}>
                                <img src="/medina.svg" alt="Отель" />
                              </div>
                              <div className={styles.hotelContent}>
                                <span className={styles.hotelName}>
                                  {medinaInfo.name}
                                </span>
                                <span className={styles.distance}>
                                  {medinaInfo.distanceText}{' '}
                                  {medinaInfo.distanceNumber ? `${medinaInfo.distanceNumber} м.` : ''}
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                        <div className={styles.wrapper}>
                          <div className={styles.tourPrice}>
                            <div className={styles.priceStatus}>
                              {booking.status === 'pending' ? 'Ожидает оплаты' : 'Оплачено'} 
                              ({booking.tour_data?.tourists?.length || 1} чел)
                            </div>
                            <div className={styles.priceAmount}>
                              <span className={styles.priceKzt}>
                                ~{Math.round(booking.tour_price * 547 * (booking.tour_data?.tourists?.length || 1))}₸
                              </span>
                              <span className={styles.priceUsd}>
                                ${booking.tour_price * (booking.tour_data?.tourists?.length || 1)}
                              </span>
                            </div>
                          </div>
                          <div className={styles.tourDates}>
                            <div className={styles.dateRange}>
                              <span className={styles.date}>
                                {booking.tour_data?.tour_dates?.[0]?.date_start || booking.tour_data?.flightOutboundDate ? 
                                  new Date(booking.tour_data?.tour_dates?.[0]?.date_start || booking.tour_data.flightOutboundDate).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }) : 
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
                
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "pending-payment" && (
              <div className={styles.leftColumn}>
                {bookingsLoading ? (
                  <div className={styles.loading}>Проверяем статус оплаты...</div>
                ) : bookings.filter(booking => booking.status === 'pending').length === 0 ? (
                  <div className={styles.noBookings}>
                    <h3 className={styles.textEx}>У вас нет туров ожидающих оплаты</h3>
                    <p className={styles.textEx}>Все ваши туры оплачены или бронирования не найдены</p>
                  </div>
                ) : (
                  bookings
                    .filter(booking => booking.status === 'pending')
                    .map((booking, index) => (
                    <div key={booking.booking_id} id={`booking-${booking.booking_id}`} className={styles.tourCard}>
                      <div className={styles.tourImage}>
                        <img 
                          src={booking.tour_image || "/tour_1.png"} 
                          alt={booking.tour_title || "Тур"} 
                        />
                      </div>
                      <div className={styles.tourContent}>
                        <div className={styles.tourContents}>
                          {booking.status === 'pending' && (() => {
                            const timer = bookingTimers[booking.booking_id];
                            if (timer && timer.expired) {
                              return (
                                <div className={styles.timerContainer}>
                                  <div className={styles.timerBox} style={{backgroundColor: '#e81142'}}>
                                    <span className={styles.timerText} style={{color: 'white'}}>Время бронирования истекло</span>
                                    <span className={styles.timer} style={{color: 'white'}}>
                                      00:00
                                    </span>
                                  </div>
                                </div>
                              );
                            } else if (timer && !timer.expired) {
                              return (
                                <div className={styles.timerContainer}>
                                  <div className={styles.timerBox}>
                                    <span className={styles.timerText}>Оплатите до истечения брони</span>
                                    <span className={styles.timer}>
                                      {`${String(timer.minutes).padStart(2, '0')}:${String(timer.seconds).padStart(2, '0')}`}
                                    </span>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })()}
                          <h3 className={styles.tourTitle}>
                            {booking.tour_data?.duration || booking.tour_title || "Тур"}
                          </h3>
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
                          {(() => {
                            const mekkaInfo = getHotelInfo(booking, 'mekka');
                            return mekkaInfo.hasData && (
                              <div className={styles.hotel}>
                                <div className={styles.hotelImage}>
                                  <img src="/mekka.svg" alt="Отель" />
                                </div>
                                <div className={styles.hotelContent}>
                                  <span className={styles.hotelName}>
                                    {mekkaInfo.name}
                                  </span>
                                  <span className={styles.distance}>
                                    {mekkaInfo.distanceText}{' '}
                                    {mekkaInfo.distanceNumber ? `${mekkaInfo.distanceNumber} м.` : ''}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                          {(() => {
                            const medinaInfo = getHotelInfo(booking, 'medina');
                            return medinaInfo.hasData && (
                              <div className={styles.hotel}>
                                <div className={styles.hotelImage}>
                                  <img src="/medina.svg" alt="Отель" />
                                </div>
                                <div className={styles.hotelContent}>
                                  <span className={styles.hotelName}>
                                    {medinaInfo.name}
                                  </span>
                                  <span className={styles.distance}>
                                    {medinaInfo.distanceText}{' '}
                                    {medinaInfo.distanceNumber ? `${medinaInfo.distanceNumber} м.` : ''}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                        <div className={styles.wrapper}>
                          <div className={styles.tourPrice}>
                            <div className={styles.priceStatus}>
                              Ожидает оплаты ({booking.tour_data?.tourists?.length || 1} чел)
                            </div>
                            <div className={styles.priceAmount}>
                              <span className={styles.priceKzt}>
                                ~{Math.round(booking.tour_price * 547 * (booking.tour_data?.tourists?.length || 1))}₸
                              </span>
                              <span className={styles.priceUsd}>
                                ${booking.tour_price * (booking.tour_data?.tourists?.length || 1)}
                              </span>
                            </div>
                          </div>
                          <div className={styles.tourDates}>
                            <div className={styles.dateRange}>
                              <span className={styles.date}>
                                {booking.tour_data?.tour_dates?.[0]?.date_start || booking.tour_data?.flightOutboundDate ? 
                                  new Date(booking.tour_data?.tour_dates?.[0]?.date_start || booking.tour_data.flightOutboundDate).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }) : 
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
                            className={styles.payBtn}
                            disabled={(() => {
                              const timer = bookingTimers[booking.booking_id];
                              return timer && timer.expired;
                            })()}
                            style={(() => {
                              const timer = bookingTimers[booking.booking_id];
                              if (timer && timer.expired) {
                                return {
                                  backgroundColor: '#ccc',
                                  color: '#666',
                                  cursor: 'not-allowed',
                                  opacity: 0.6
                                };
                              }
                              return {};
                            })()}
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem('atlas_token');
                                if (!token) {
                                  router.push('/auth?mode=login');
                                  return;
                                }

                                console.log('Данные бронирования:', booking);
                                
                                if (!booking.tour_price || booking.tour_price <= 0) {
                                  alert('Не удалось определить цену тура');
                                  return;
                                }

                                const touristsCount = booking.tour_data?.tourists?.length || 1;
                                const amount = Math.round(booking.tour_price * 547 * touristsCount);
                                const paymentRequestData = {
                                  order_id: booking.booking_id,
                                  amount: amount,
                                  tour_id: parseInt(booking.tour_id),
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
                        
                                const paymentResult = await paymentResponse.json();
                                console.log('Получен ответ от бэкенда:', paymentResult);
                                
                                if (paymentResult.success && paymentResult.payment_url) {
                                  console.log('Получен URL для оплаты:', paymentResult.payment_url);
                                  
                                  window.open(paymentResult.payment_url, '_blank');
                                } else {
                                  throw new Error('Неверный ответ от сервера');
                                }
                              } catch (error) {
                                console.error('Ошибка при оплате:', error);
                                alert('Ошибка при оплате: ' + error.message);
                              }
                            }}
                          >
                            {(() => {
                              const timer = bookingTimers[booking.booking_id];
                              if (timer && timer.expired) {
                                return 'Время истекло';
                              }
                              return 'Оплатить';
                            })()}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Готовимся к путешествию...</div>}>
      <ProfilePageContent />
    </Suspense>
  );
}
