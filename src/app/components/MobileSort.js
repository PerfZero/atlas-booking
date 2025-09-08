'use client';
import { useState } from 'react';
import styles from './MobileSort.module.css';

export default function MobileSort({ isOpen, onClose, value, onChange, options }) {
  if (!isOpen) return null;

  const handleOptionChange = (newValue) => {
    onChange(newValue);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Сортировка</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className={styles.options}>
          {options.map((option) => (
            <label key={option.value} className={styles.optionContainer}>
              <div className={styles.radioWrapper}>
                <input
                  type="radio"
                  name="sort"
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => handleOptionChange(option.value)}
                  className={styles.radioInput}
                />
                <div className={`${styles.radioButton} ${value === option.value ? styles.checked : ''}`}>
                  {value === option.value && <div className={styles.radioDot}></div>}
                </div>
              </div>
              <span className={styles.optionText}>{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
