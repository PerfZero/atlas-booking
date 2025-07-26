'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import CustomSelect from './CustomSelect';
import DatePicker from './DatePicker';
import styles from './SearchForm.module.css';

export default function SearchForm({ className = '' }) {
  const router = useRouter();
  const datePickerRef = useRef(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [formData, setFormData] = useState({
    departureCity: 'almaty',
    travelDate: 'not-specified',
    pilgrimageType: 'umrah'
  });

  const cityOptions = [
    { value: 'almaty', label: 'Алматы' },
    { value: 'astana', label: 'Астана' },
    { value: 'aktau', label: 'Актау' },
    { value: 'shymkent', label: 'Шымкент' }
  ];

  const formatDateRange = () => {
    if (selectedStartDate && selectedEndDate) {
      const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);
        return `${day}.${month}.${year}`;
      };
      return `${formatDate(selectedStartDate)} - ${formatDate(selectedEndDate)}`;
    }
    return 'Не указано';
  };

  const pilgrimageOptions = [
    { value: 'umrah', label: 'Умра' },
    { value: 'hajj', label: 'Хадж' }
  ];

  const handleSelectChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateSelect = (startDate, endDate) => {
    setSelectedStartDate(startDate);
    setSelectedEndDate(endDate);
    setFormData(prev => ({
      ...prev,
      travelDate: 'custom'
    }));
    setIsDatePickerOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsDatePickerOpen(false);
      }
    };

    if (isDatePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDatePickerOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const searchParams = new URLSearchParams({
      departureCity: formData.departureCity,
      travelDate: formData.travelDate,
      pilgrimageType: formData.pilgrimageType
    });
    
    router.push(`/search?${searchParams.toString()}`);
  };

  return (
    <>
      <form className={`${styles.searchForm} ${className}`} onSubmit={handleSubmit}>
        <CustomSelect
          label="Город вылета"
          options={cityOptions}
          value={formData.departureCity}
          onChange={(value) => handleSelectChange('departureCity', value)}
          placeholder="Выберите город"
        />
        
        <div className={styles.selectGroup} ref={datePickerRef}>
          <label>Дата поездки</label>
          <div 
            className={styles.select}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDatePickerOpen(!isDatePickerOpen);
            }}
          >
            <span className={styles.selectValue}>
              {formatDateRange()}
            </span>
                         <div className={`${styles.selectArrow} ${isDatePickerOpen ? styles.selectArrowUp : ''}`}>
               <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M1 1.5L6 6.5L11 1.5" stroke="#717680" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
               </svg>
             </div>
          </div>
          <DatePicker
            isOpen={isDatePickerOpen}
            onClose={() => setIsDatePickerOpen(false)}
            onDateSelect={handleDateSelect}
            selectedStartDate={selectedStartDate}
            selectedEndDate={selectedEndDate}
          />
        </div>
        
        <CustomSelect
          label="Тип паломничества"
          options={pilgrimageOptions}
          value={formData.pilgrimageType}
          onChange={(value) => handleSelectChange('pilgrimageType', value)}
          placeholder="Выберите тип"
        />
        
                 <button type="submit" className={styles.searchBtn}>
           Найти
         </button>
       </form>
     </>
   );
} 