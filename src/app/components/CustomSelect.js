'use client';
import { useState, useRef, useEffect } from 'react';
import styles from './CustomSelect.module.css';

export default function CustomSelect({ 
  label, 
  options, 
  value, 
  onChange, 
  placeholder = "Выберите опцию" 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(
    options.find(option => option.value === value) || null
  );
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

  useEffect(() => {
    const newSelectedOption = options.find(option => option.value === value) || null;
    setSelectedOption(newSelectedOption);
  }, [value, options]);

  const handleSelect = (option) => {
    setSelectedOption(option);
    onChange(option.value);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.formField}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.selectContainer} ref={selectRef}>
        <div 
          className={`${styles.selectTrigger} ${isOpen ? styles.open : ''}`}
          onClick={toggleDropdown}
        >
          <span className={styles.selectedValue}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <div className={`${styles.arrow} ${isOpen ? styles.arrowUp : ''}`}>
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1.5L6 6.5L11 1.5" stroke="#717680" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        
        {isOpen && (
          <div className={styles.dropdown}>
            {options.map((option) => (
              <div
                key={option.value}
                className={`${styles.option} ${selectedOption?.value === option.value ? styles.selected : ''}`}
                onClick={() => handleSelect(option)}
              >
                <span className={styles.optionText}>{option.label}</span>
                {selectedOption?.value === option.value && (
                  <div className={styles.checkmark}>
                    <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.6667 1L5.50004 10.1667L1.33337 6" stroke="#253168" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 