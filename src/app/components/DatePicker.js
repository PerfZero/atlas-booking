'use client';
import { useState, useEffect } from 'react';
import styles from './DatePicker.module.css';

export default function DatePicker({ 
  isOpen, 
  onClose, 
  onDateSelect, 
  selectedStartDate, 
  selectedEndDate,
  availableTours = []
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState(null);
  const [startDate, setStartDate] = useState(selectedStartDate);
  const [endDate, setEndDate] = useState(selectedEndDate);
  const [selectedTab, setSelectedTab] = useState('7');

  useEffect(() => {
    setStartDate(selectedStartDate);
    setEndDate(selectedEndDate);
  }, [selectedStartDate, selectedEndDate]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}.${month}.${year}`;
  };

  const calculateDaysDiff = (start, end) => {
    if (!start || !end) return 0;
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  const isDateInRange = (date) => {
    if (!startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
  };

  const isDateSelected = (date) => {
    if (!date) return false;
    return (startDate && date.getTime() === startDate.getTime()) ||
           (endDate && date.getTime() === endDate.getTime());
  };

  const isDateDisabled = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return true;
    
    // Показываем как неактивные дни без доступных туров
    if (!hasAvailableTour(date)) return true;
    
    return false;
  };

  const hasAvailableTour = (date) => {
    if (!date || !availableTours.length) return false;
    
    // Используем локальную дату без учета часовых поясов
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const selectedDuration = parseInt(selectedTab);
    
    return availableTours.some(tour => {
      if (!tour.tour_dates || !Array.isArray(tour.tour_dates)) return false;
      
      return tour.tour_dates.some(dateRange => {
        const startDate = dateRange.date_start;
        const tourDuration = dateRange.duration ? parseInt(dateRange.duration) : 7;
        
        if (!startDate) return false;
        
        // Показываем дату как доступную только если длительность тура совпадает с выбранной вкладкой
        return dateStr === startDate && tourDuration === selectedDuration;
      });
    });
  };

  const handleDateClick = (date, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!date || isDateDisabled(date)) return;
    
    // Автоматически выбираем дату начала и конца на основе выбранной длительности
    const duration = selectedTab === '7' ? 7 : 10;
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + duration);
    
    setStartDate(date);
    setEndDate(endDate);
  };

  const handleTabClick = (tab, event) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedTab(tab);
    setStartDate(null);
    setEndDate(null);
  };

  const handleDateHover = (date) => {
    setHoveredDate(date);
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (startDate && endDate) {
      onDateSelect(startDate, endDate);
      onClose();
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setStartDate(null);
    setEndDate(null);
  };

  const nextMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
  
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  if (!isOpen) return null;

  const handleDropdownClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <>
      <div 
        className={styles.overlay}
        onClick={onClose}
      />
      <div 
        className={styles.dropdown} 
        onClick={handleDropdownClick}
        onMouseDown={handleMouseDown}
      >
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${selectedTab === '7' ? styles.active : ''}`}
            onClick={(e) => handleTabClick('7', e)}
          >
            7-9 дней
          </button>
          <button 
            className={`${styles.tab} ${selectedTab === '10' ? styles.active : ''}`}
            onClick={(e) => handleTabClick('10', e)}
          >
            10-15 дней
          </button>
        </div>

        <div className={styles.dateInputs}>
          <div className={styles.dateInput}>
            <span className={styles.planeIcon}>✈</span>
            <span className={styles.dateText}>
              {startDate ? formatDate(startDate) : '--- ---'}
            </span>
          </div>
          <span className={styles.separator}>-</span>
          <div className={styles.dateInput}>
            <span className={styles.planeIcon}>✈</span>
            <span className={styles.dateText}>
              {endDate ? formatDate(endDate) : '--- ---'}
            </span>
          </div>
        </div>

        <div className={styles.calendars}>
          <div className={styles.calendar}>
            <div className={styles.calendarHeader}>
              <button onClick={(e) => prevMonth(e)} className={styles.navButton}>‹</button>
              <h3>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
              <button onClick={(e) => nextMonth(e)} className={`${styles.navButton} ${styles.mobileOnly}`}>›</button>
              <button className={`${styles.navButtonHidden} ${styles.desktopOnly}`}></button>
            </div>
            <div className={styles.weekdays}>
              <span>ПН</span>
              <span>ВТ</span>
              <span>СР</span>
              <span>ЧТ</span>
              <span>ПТ</span>
              <span>СБ</span>
              <span>ВС</span>
            </div>
            <div className={styles.days}>
              {getDaysInMonth(currentMonth).map((date, index) => (
                <button
                  key={index}
                  className={`
                    ${styles.day}
                    ${!date ? styles.empty : ''}
                    ${date && isDateDisabled(date) ? styles.disabled : ''}
                    ${date && isDateSelected(date) ? styles.selected : ''}
                    ${date && isDateInRange(date) ? styles.inRange : ''}
                    ${date && hoveredDate && startDate && !endDate && 
                      date > startDate && date <= hoveredDate ? styles.hoverRange : ''}
                  `}
                  onClick={(e) => handleDateClick(date, e)}
                  onMouseEnter={() => handleDateHover(date)}
                  disabled={!date || isDateDisabled(date)}
                >
                  {date ? date.getDate() : ''}
                </button>
              ))}
            </div>
          </div>

          <div className={`${styles.calendar} ${styles.secondCalendar} ${styles.desktopOnly}`}>
            <div className={styles.calendarHeader}>
              <button className={styles.navButtonHidden}></button>
              <h3>{monthNames[nextMonthDate.getMonth()]} {nextMonthDate.getFullYear()}</h3>
              <button onClick={(e) => nextMonth(e)} className={styles.navButton}>›</button>
            </div>
            <div className={styles.weekdays}>
              <span>ПН</span>
              <span>ВТ</span>
              <span>СР</span>
              <span>ЧТ</span>
              <span>ПТ</span>
              <span>СБ</span>
              <span>ВС</span>
            </div>
            <div className={styles.days}>
              {getDaysInMonth(nextMonthDate).map((date, index) => (
                <button
                  key={index}
                  className={`
                    ${styles.day}
                    ${!date ? styles.empty : ''}
                    ${date && isDateDisabled(date) ? styles.disabled : ''}
                    ${date && isDateSelected(date) ? styles.selected : ''}
                    ${date && isDateInRange(date) ? styles.inRange : ''}
                    ${date && hoveredDate && startDate && !endDate && 
                      date > startDate && date <= hoveredDate ? styles.hoverRange : ''}
                  `}
                  onClick={(e) => handleDateClick(date, e)}
                  onMouseEnter={() => handleDateHover(date)}
                  disabled={!date || isDateDisabled(date)}
                >
                  {date ? date.getDate() : ''}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.dateRange}>
            {startDate && (
              <div className={styles.dateItem}>
                <span className={styles.planeIcon}>✈</span>
                {formatDate(startDate)}
              </div>
            )}
            {startDate && endDate && <span className={styles.separator}>-</span>}
            {endDate && (
              <div className={styles.dateItem}>
                <span className={styles.planeIcon}>✈</span>
                {formatDate(endDate)}
              </div>
            )}
            {startDate && !endDate && (
              <div className={styles.hint}>
                Выберите {selectedTab === '7' ? '7-9' : '10-15'} дней
              </div>
            )}
            {startDate && endDate && (
              <div className={styles.hint}>
                Выбрано {calculateDaysDiff(startDate, endDate)} дней
              </div>
            )}
          </div>
          <div className={styles.buttons}>
            <button onClick={(e) => handleCancel(e)} className={styles.cancelButton}>
              Отменить
            </button>
            <button 
              onClick={(e) => handleConfirm(e)} 
              className={styles.confirmButton}
              disabled={!startDate || !endDate}
            >
              Выбрать
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 