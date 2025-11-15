'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CustomSelect from './CustomSelect';
import DatePicker from './DatePicker';
import styles from './SearchForm.module.css';
import Toast from './Toast';
import { getTours } from '../../lib/wordpress-api';

function SearchFormWithParams({ className = '', isHomePage = false }) {
  const searchParams = useSearchParams();
  return <SearchForm searchParams={searchParams} className={className} isHomePage={isHomePage} />;
}

function SearchForm({ searchParams, className = '', isHomePage = false }) {
  const router = useRouter();
  const datePickerRef = useRef(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [formData, setFormData] = useState({
    departureCity: 'all',
    travelDate: 'not-specified',
    pilgrimageType: 'all'
  });
  const [dateError, setDateError] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [showResults, setShowResults] = useState(false);
  const [availableTours, setAvailableTours] = useState([]);

  const cityOptions = [
    { value: 'all', label: 'Все города' },
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

  const formatDateRangeCompact = () => {
    if (selectedStartDate && selectedEndDate) {
      const months = [
        'янв.', 'фев.', 'мар.', 'апр.', 'май', 'июн.',
        'июл.', 'авг.', 'сен.', 'окт.', 'ноя.', 'дек.'
      ];
      const startMonth = months[selectedStartDate.getMonth()];
      const endMonth = months[selectedEndDate.getMonth()];
      return `${selectedStartDate.getDate()} ${startMonth} - ${selectedEndDate.getDate()} ${endMonth}`;
    }
    return 'Не указано';
  };

  const [pilgrimageOptions, setPilgrimageOptions] = useState([]);

  const getCityLabel = (value) => {
    const city = cityOptions.find(option => option.value === value);
    return city ? city.label : value;
  };

  const getPilgrimageLabel = (value) => {
    if (Array.isArray(value)) {
      // Если это массив (из таксономии), берем первый элемент
      value = value[0];
    }
    const pilgrimage = pilgrimageOptions.find(option => option.value === value);
    return pilgrimage ? pilgrimage.label : value;
  };

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
    setDateError(false);
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

  useEffect(() => {
    const loadTours = async () => {
      try {
        const tours = await getTours();
        setAvailableTours(tours);
      } catch (error) {
        console.error('Ошибка загрузки туров:', error);
      }
    };

    const loadPilgrimageTypes = async () => {
      try {
        const response = await fetch('https://api.booking.atlas.kz/wp-json/atlas-hajj/v1/pilgrimage-types');
        const data = await response.json();
        if (data.success && data.pilgrimage_types) {
          const options = [
            { value: 'all', label: 'Все' },
            ...data.pilgrimage_types.map(type => ({
              value: type.slug,
              label: type.name
            }))
          ];
          setPilgrimageOptions(options);
        }
      } catch (error) {
        console.error('Ошибка загрузки типов паломничества:', error);
      }
    };

    loadTours();
    loadPilgrimageTypes();
  }, []);

  useEffect(() => {
    const departureCity = searchParams.get('departureCity');
    const travelDate = searchParams.get('travelDate');
    const pilgrimageType = searchParams.get('pilgrimageType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (departureCity) {
      setFormData(prev => ({ ...prev, departureCity }));
    }
    if (travelDate) {
      setFormData(prev => ({ ...prev, travelDate }));
    }
    if (pilgrimageType) {
      setFormData(prev => ({ ...prev, pilgrimageType }));
    }
    if (startDate && endDate) {
      const parseDate = (dateString) => {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
      };
      setSelectedStartDate(parseDate(startDate));
      setSelectedEndDate(parseDate(endDate));
    }

    const hasSearchParams = departureCity && travelDate && pilgrimageType && startDate && endDate;
    setShowResults(hasSearchParams);
  }, [searchParams, pilgrimageOptions]);

  useEffect(() => {
    if (selectedStartDate && selectedEndDate) {
      setShowResults(true);
    }
  }, [selectedStartDate, selectedEndDate]);

  useEffect(() => {
    if (formData.departureCity && formData.pilgrimageType && selectedStartDate && selectedEndDate) {
      setShowResults(true);
    }
  }, [formData.departureCity, formData.pilgrimageType, selectedStartDate, selectedEndDate]);

  useEffect(() => {
    if (!isHomePage && selectedStartDate && selectedEndDate) {
      const currentStartDate = searchParams.get('startDate');
      const currentEndDate = searchParams.get('endDate');
      
      const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString();
        return `${year}-${month}-${day}`;
      };
      
      const newStartDate = formatDate(selectedStartDate);
      const newEndDate = formatDate(selectedEndDate);
      
      if (currentStartDate !== newStartDate || currentEndDate !== newEndDate) {
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.set('startDate', newStartDate);
        newSearchParams.set('endDate', newEndDate);
        router.push(`/search?${newSearchParams.toString()}`);
      }
    }
  }, [selectedStartDate, selectedEndDate, isHomePage, searchParams, router]);

  const isFormValid = selectedStartDate && selectedEndDate;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedStartDate || !selectedEndDate) {
      setDateError(true);
      setToast({ visible: true, message: 'Пожалуйста, выберите даты поездки' });
      return;
    }
    
    const searchParams = new URLSearchParams({
      departureCity: formData.departureCity,
      travelDate: formData.travelDate,
      pilgrimageType: formData.pilgrimageType
    });

    if (selectedStartDate && selectedEndDate) {
      const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString();
        return `${year}-${month}-${day}`;
      };
      
      searchParams.append('startDate', formatDate(selectedStartDate));
      searchParams.append('endDate', formatDate(selectedEndDate));
    }
    
    router.push(`/search?${searchParams.toString()}`);
  };

  return (
    <>
      {showResults && !isHomePage && (
        <div 
          className={`${styles.searchResults} ${className}`}
          onClick={() => router.push('/')}
        >
          <div className={styles.resultsContent}>
            <span className={styles.resultItem}>{getCityLabel(formData.departureCity)}</span>
            <span className={styles.resultSeparator}>·</span>
            <span className={styles.resultItem}>{formatDateRangeCompact()}</span>
            <span className={styles.resultSeparator}>·</span>
            <span className={styles.resultItem}>{getPilgrimageLabel(formData.pilgrimageType)}</span>
          </div>
        </div>
      )}
      
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
            className={`${styles.select} ${dateError ? styles.error : ''}`}
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
            availableTours={availableTours}
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
      <Toast
        message={toast.message}
        visible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </>
  );
}

export default SearchFormWithParams; 