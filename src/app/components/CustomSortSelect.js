import { useState, useRef, useEffect } from 'react';
import styles from '../search/page.module.css';

export default function CustomSortSelect({ value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className={`${styles.customSelect} ${isOpen ? styles.open : ''}`} ref={selectRef}>
      <button 
        className={styles.selectButton}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <div className={styles.sortIcon}>
          <img src="/sort.svg" alt="Сортировка" width="16" height="16" />
        </div>
        <span className={styles.selectText}>{selectedOption ? selectedOption.label : 'Сортировка не выбрана'}</span>
        <div className={styles.arrowIcon}>
         
        </div>
      </button>
      
      {isOpen && (
        <div className={styles.dropdown}>
          {options.map((option) => (
            <button
              key={option.value}
              className={`${styles.dropdownOption} ${value === option.value ? styles.selected : ''}`}
              onClick={() => handleSelect(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 