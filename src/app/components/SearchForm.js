'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CustomSelect from './CustomSelect';
import styles from './SearchForm.module.css';

export default function SearchForm({ className = '' }) {
  const router = useRouter();
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

  const dateOptions = [
    { value: 'not-specified', label: 'Не указано' },
    { value: 'january', label: 'Январь 2024' },
    { value: 'february', label: 'Февраль 2024' },
    { value: 'march', label: 'Март 2024' },
    { value: 'april', label: 'Апрель 2024' }
  ];

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
    <form className={`${styles.searchForm} ${className}`} onSubmit={handleSubmit}>
      <CustomSelect
        label="Город вылета"
        options={cityOptions}
        value={formData.departureCity}
        onChange={(value) => handleSelectChange('departureCity', value)}
        placeholder="Выберите город"
      />
      
      <CustomSelect
        label="Дата поездки"
        options={dateOptions}
        value={formData.travelDate}
        onChange={(value) => handleSelectChange('travelDate', value)}
        placeholder="Выберите дату"
      />
      
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
  );
} 