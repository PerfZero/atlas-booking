import { useState, useEffect } from 'react';
import styles from '../search/page.module.css';

export default function SearchFilters({ 
  priceRange, 
  setPriceRange,
  minPrice = 0,
  maxPrice = 3000,
  flightTypes, 
  setFlightTypes, 
  ticketTypes, 
  setTicketTypes, 
  mekkaHotels, 
  setMekkaHotels, 
  medinaHotels, 
  setMedinaHotels, 
  mekkaDistance, 
  setMekkaDistance,
  minMekkaDistance = 0,
  maxMekkaDistance = 4000,
  medinaDistance, 
  setMedinaDistance,
  minMedinaDistance = 0,
  maxMedinaDistance = 4000, 
  foodTypes, 
  setFoodTypes, 
  transferTypes, 
  setTransferTypes,
  availableTransfers = []
}) {
  const handleMinPriceChange = (e) => {
    const value = parseInt(e.target.value);
    setPriceRange(prev => ({
      ...prev,
      min: Math.min(value, prev.max - 100)
    }));
  };

  const handleMaxPriceChange = (e) => {
    const value = parseInt(e.target.value);
    setPriceRange(prev => ({
      ...prev,
      max: Math.max(value, prev.min + 100)
    }));
  };

  const handleFlightTypeChange = (type) => {
    setFlightTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleTicketTypeChange = (type) => {
    setTicketTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleMekkaHotelChange = (type) => {
    setMekkaHotels(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleMedinaHotelChange = (type) => {
    setMedinaHotels(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleMekkaDistanceChange = (bound, value) => {
    const numValue = parseInt(value) || 0;
    setMekkaDistance(prev => ({
      ...prev,
      [bound]: numValue
    }));
  };

  const handleMedinaDistanceChange = (bound, value) => {
    const numValue = parseInt(value) || 0;
    setMedinaDistance(prev => ({
      ...prev,
      [bound]: numValue
    }));
  };

  // Обновляем синюю полосу для расстояния в Мекке
  useEffect(() => {
    const updateMekkaRange = () => {
      const minSlider = document.getElementById('mekkaMinDistance');
      const maxSlider = document.getElementById('mekkaMaxDistance');
      const sliderRanges = document.querySelectorAll(`.${styles.distanceSlider} .${styles.sliderRange}`);
      const sliderRange = sliderRanges[0]; // Первый - для Мекки
      
      if (minSlider && maxSlider && sliderRange) {
        const min = parseInt(minSlider.min);
        const max = parseInt(minSlider.max);
        const minVal = parseInt(minSlider.value);
        const maxVal = parseInt(maxSlider.value);
        
        const minPercent = ((minVal - min) / (max - min)) * 100;
        const maxPercent = ((maxVal - min) / (max - min)) * 100;
        
        sliderRange.style.left = `${minPercent}%`;
        sliderRange.style.width = `${maxPercent - minPercent}%`;
      }
    };
    
    updateMekkaRange();
  }, [mekkaDistance]);

  // Обновляем синюю полосу для расстояния в Медине
  useEffect(() => {
    const updateMedinaRange = () => {
      const minSlider = document.getElementById('medinaMinDistance');
      const maxSlider = document.getElementById('medinaMaxDistance');
      const sliderRanges = document.querySelectorAll(`.${styles.distanceSlider} .${styles.sliderRange}`);
      const sliderRange = sliderRanges[1]; // Второй - для Медины
      
      if (minSlider && maxSlider && sliderRange) {
        const min = parseInt(minSlider.min);
        const max = parseInt(minSlider.max);
        const minVal = parseInt(minSlider.value);
        const maxVal = parseInt(maxSlider.value);
        
        const minPercent = ((minVal - min) / (max - min)) * 100;
        const maxPercent = ((maxVal - min) / (max - min)) * 100;
        
        sliderRange.style.left = `${minPercent}%`;
        sliderRange.style.width = `${maxPercent - minPercent}%`;
      }
    };
    
    updateMedinaRange();
  }, [medinaDistance]);

  const handleFoodTypeChange = (type) => {
    setFoodTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleTransferTypeChange = (type) => {
    setTransferTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // Инициализация линии при загрузке компонента
  useEffect(() => {
    const updateSliderRange = () => {
      const minSlider = document.getElementById('minPrice');
      const maxSlider = document.getElementById('maxPrice');
      const sliderRange = document.querySelector(`.${styles.sliderRange}`);
      
      if (minSlider && maxSlider && sliderRange) {
        const min = parseInt(minSlider.min);
        const max = parseInt(minSlider.max);
        const minVal = parseInt(minSlider.value);
        const maxVal = parseInt(maxSlider.value);
        
        const minPercent = ((minVal - min) / (max - min)) * 100;
        const maxPercent = ((maxVal - min) / (max - min)) * 100;
        
        sliderRange.style.left = `${minPercent}%`;
        sliderRange.style.width = `${maxPercent - minPercent}%`;
      }
    };

    // Инициализация при загрузке
    const timeoutId = setTimeout(updateSliderRange, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Обновляем позицию линии при изменении priceRange
  useEffect(() => {
    const updateSliderRange = () => {
      const minSlider = document.getElementById('minPrice');
      const maxSlider = document.getElementById('maxPrice');
      const sliderRange = document.querySelector(`.${styles.sliderRange}`);
      
      if (minSlider && maxSlider && sliderRange) {
        const min = parseInt(minSlider.min);
        const max = parseInt(minSlider.max);
        const minVal = parseInt(minSlider.value);
        const maxVal = parseInt(maxSlider.value);
        
        const minPercent = ((minVal - min) / (max - min)) * 100;
        const maxPercent = ((maxVal - min) / (max - min)) * 100;
        
        sliderRange.style.left = `${minPercent}%`;
        sliderRange.style.width = `${maxPercent - minPercent}%`;
      }
    };

    updateSliderRange();
    
    // Также обновляем при изменении ползунков
    const minSlider = document.getElementById('minPrice');
    const maxSlider = document.getElementById('maxPrice');
    
    if (minSlider) minSlider.addEventListener('input', updateSliderRange);
    if (maxSlider) maxSlider.addEventListener('input', updateSliderRange);
    
    return () => {
      if (minSlider) minSlider.removeEventListener('input', updateSliderRange);
      if (maxSlider) maxSlider.removeEventListener('input', updateSliderRange);
    };
  }, [priceRange]);

  return (
    <aside className={styles.filters}>
      <h3 className={styles.filtersTitle}>Все фильтры</h3>
      
      <div className={styles.filterSection}>
        <h4 className={styles.filterSectionTitle}>Стоимость тура</h4>
        <div className={styles.priceRange}>
          <div className={styles.priceSlider}>
            <div className={styles.sliderTrack}>
              <div className={styles.sliderRange}></div>
            </div>
            <div className={styles.sliderThumbs}>
              <input 
                type="range" 
                min={minPrice} 
                max={maxPrice} 
                value={priceRange.min}
                onChange={handleMinPriceChange}
                className={styles.rangeInput}
                id="minPrice"
              />
              <input 
                type="range" 
                min={minPrice} 
                max={maxPrice} 
                value={priceRange.max}
                onChange={handleMaxPriceChange}
                className={styles.rangeInput}
                id="maxPrice"
              />
            </div>
          </div>
          <div className={styles.priceInputs}>
            <span className={styles.priceValue}>{priceRange.min}$</span>
            <span>-</span>
            <span className={styles.priceValue}>{priceRange.max}$</span>
          </div>
        </div>
      </div>

      <div className={styles.filterSection}>
        <h4 className={styles.filterSectionTitle}>Перелет</h4>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Тип рейса:</label>
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={flightTypes.direct}
                onChange={() => handleFlightTypeChange('direct')}
              />
              <span>Прямой</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={flightTypes.transfer}
                onChange={() => handleFlightTypeChange('transfer')}
              />
              <span>С пересадкой</span>
            </label>
          </div>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Тип билета:</label>
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={ticketTypes.economy}
                onChange={() => handleTicketTypeChange('economy')}
              />
              <span>Эконом</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={ticketTypes.business}
                onChange={() => handleTicketTypeChange('business')}
              />
              <span>Бизнес-класс</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={ticketTypes.first}
                onChange={() => handleTicketTypeChange('first')}
              />
              <span>Первый класс</span>
            </label>
          </div>
        </div>
      </div>

      <div className={styles.filterSection}>
        <h4 className={styles.filterSectionTitle}>Отель в Мекке</h4>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Уровень отеля в Мекке:</label>
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={mekkaHotels.five}
                onChange={() => handleMekkaHotelChange('five')}
              />
              <span>
                <img src="/start.svg" alt="★" className={styles.starIcon} />
                <img src="/start.svg" alt="★" className={styles.starIcon} />
                <img src="/start.svg" alt="★" className={styles.starIcon} />
                <img src="/start.svg" alt="★" className={styles.starIcon} />
                <img src="/start.svg" alt="★" className={styles.starIcon} />
              </span>
            </label>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={mekkaHotels.four}
                onChange={() => handleMekkaHotelChange('four')}
              />
              <span>
                <img src="/start.svg" alt="★" className={styles.starIcon} />
                <img src="/start.svg" alt="★" className={styles.starIcon} />
                <img src="/start.svg" alt="★" className={styles.starIcon} />
                <img src="/start.svg" alt="★" className={styles.starIcon} />
                <img src="/start.svg" alt="☆" className={styles.starIconEmpty} />
              </span>
            </label>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={mekkaHotels.three}
                onChange={() => handleMekkaHotelChange('three')}
              />
              <span>
                <img src="/start.svg" alt="★" className={styles.starIcon} />
                <img src="/start.svg" alt="★" className={styles.starIcon} />
                <img src="/start.svg" alt="★" className={styles.starIcon} />
                <img src="/start.svg" alt="☆" className={styles.starIconEmpty} />
                <img src="/start.svg" alt="☆" className={styles.starIconEmpty} />
              </span>
            </label>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={mekkaHotels.two}
                onChange={() => handleMekkaHotelChange('two')}
              />
              <span>
                <img src="/start.svg" alt="★" className={styles.starIcon} />
                <img src="/start.svg" alt="★" className={styles.starIcon} />
                <img src="/start.svg" alt="☆" className={styles.starIconEmpty} />
                <img src="/start.svg" alt="☆" className={styles.starIconEmpty} />
                <img src="/start.svg" alt="☆" className={styles.starIconEmpty} />
              </span>
            </label>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={mekkaHotels.one}
                onChange={() => handleMekkaHotelChange('one')}
              />
              <span>
                <img src="/start.svg" alt="★" className={styles.starIcon} />
                <img src="/start.svg" alt="☆" className={styles.starIconEmpty} />
                <img src="/start.svg" alt="☆" className={styles.starIconEmpty} />
                <img src="/start.svg" alt="☆" className={styles.starIconEmpty} />
                <img src="/start.svg" alt="☆" className={styles.starIconEmpty} />
              </span>
            </label>
          </div>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Расстояние отеля в Мекке до Каабы:</label>
          <div className={styles.distanceRange}>
            <div className={styles.distanceSlider}>
              <div className={styles.sliderTrack}>
                <div className={styles.sliderRange}></div>
              </div>
              <div className={styles.sliderThumbs}>
                <input 
                  type="range" 
                  min={minMekkaDistance} 
                  max={maxMekkaDistance} 
                  value={mekkaDistance.min}
                  onChange={(e) => handleMekkaDistanceChange('min', e.target.value)}
                  className={styles.rangeInput}
                  id="mekkaMinDistance"
                />
                <input 
                  type="range" 
                  min={minMekkaDistance} 
                  max={maxMekkaDistance} 
                  value={mekkaDistance.max}
                  onChange={(e) => handleMekkaDistanceChange('max', e.target.value)}
                  className={styles.rangeInput}
                  id="mekkaMaxDistance"
                />
              </div>
            </div>
            <div className={styles.distanceInputs}>
              <span className={styles.distanceValue}>{mekkaDistance.min}м</span>
              <span>-</span>
              <span className={styles.distanceValue}>{mekkaDistance.max}м</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.filterSection}>
        <h4 className={styles.filterSectionTitle}>Отель в Медине</h4>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Уровень отеля в Медине:</label>
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={medinaHotels.five}
                onChange={() => handleMedinaHotelChange('five')}
              />
              <span>
                <img src="/start.svg" alt="★" className={styles.starIcon} />
                <img src="/start.svg" alt="★" className={styles.starIcon} />
                <img src="/start.svg" alt="★" className={styles.starIcon} />
                <img src="/start.svg" alt="★" className={styles.starIcon} />
                <img src="/start.svg" alt="★" className={styles.starIcon} />
              </span>
            </label>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={medinaHotels.four}
                onChange={() => handleMedinaHotelChange('four')}
              />
              <span>
                <img src="/start.svg" alt="★" className={styles.starIcon} />
                <img src="/start.svg" alt="★" className={styles.starIcon} />
                <img src="/start.svg" alt="★" className={styles.starIcon} />
                <img src="/start.svg" alt="★" className={styles.starIcon} />
                <img src="/start.svg" alt="☆" className={styles.starIconEmpty} />
              </span>
            </label>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={medinaHotels.three}
                onChange={() => handleMedinaHotelChange('three')}
              />
              <span>
                <img src="/start.svg" alt="★" className={styles.starIcon} />
                <img src="/start.svg" alt="★" className={styles.starIcon} />
                <img src="/start.svg" alt="★" className={styles.starIcon} />
                <img src="/start.svg" alt="☆" className={styles.starIconEmpty} />
                <img src="/start.svg" alt="☆" className={styles.starIconEmpty} />
              </span>
            </label>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={medinaHotels.two}
                onChange={() => handleMedinaHotelChange('two')}
              />
              <span>
                <img src="/start.svg" alt="★" className={styles.starIcon} />
                <img src="/start.svg" alt="★" className={styles.starIcon} />
                <img src="/start.svg" alt="☆" className={styles.starIconEmpty} />
                <img src="/start.svg" alt="☆" className={styles.starIconEmpty} />
                <img src="/start.svg" alt="☆" className={styles.starIconEmpty} />
              </span>
            </label>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={medinaHotels.one}
                onChange={() => handleMedinaHotelChange('one')}
              />
              <span>
                <img src="/start.svg" alt="★" className={styles.starIcon} />
                <img src="/start.svg" alt="☆" className={styles.starIconEmpty} />
                <img src="/start.svg" alt="☆" className={styles.starIconEmpty} />
                <img src="/start.svg" alt="☆" className={styles.starIconEmpty} />
                <img src="/start.svg" alt="☆" className={styles.starIconEmpty} />
              </span>
            </label>
          </div>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Расстояние отеля в Медине до мечети:</label>
          <div className={styles.distanceRange}>
            <div className={styles.distanceSlider}>
              <div className={styles.sliderTrack}>
                <div className={styles.sliderRange}></div>
              </div>
              <div className={styles.sliderThumbs}>
                <input 
                  type="range" 
                  min={minMedinaDistance} 
                  max={maxMedinaDistance} 
                  value={medinaDistance.min}
                  onChange={(e) => handleMedinaDistanceChange('min', e.target.value)}
                  className={styles.rangeInput}
                  id="medinaMinDistance"
                />
                <input 
                  type="range" 
                  min={minMedinaDistance} 
                  max={maxMedinaDistance} 
                  value={medinaDistance.max}
                  onChange={(e) => handleMedinaDistanceChange('max', e.target.value)}
                  className={styles.rangeInput}
                  id="medinaMaxDistance"
                />
              </div>
            </div>
            <div className={styles.distanceInputs}>
              <span className={styles.distanceValue}>{medinaDistance.min}м</span>
              <span>-</span>
              <span className={styles.distanceValue}>{medinaDistance.max}м</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.filterSection}>
        <h4 className={styles.filterSectionTitle}>Общее</h4>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Питание:</label>
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={foodTypes.BB}
                onChange={() => handleFoodTypeChange('BB')}
              />
              <span>BB (Завтрак)</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={foodTypes.HB}
                onChange={() => handleFoodTypeChange('HB')}
              />
              <span>HB (Полупансион)</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={foodTypes.FB}
                onChange={() => handleFoodTypeChange('FB')}
              />
              <span>FB (Полный пансион)</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={foodTypes.AI}
                onChange={() => handleFoodTypeChange('AI')}
              />
              <span>AI (Всё включено)</span>
            </label>
          </div>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Трансфер:</label>
          <div className={styles.checkboxGroup}>
            {Array.isArray(availableTransfers) && availableTransfers.map((transfer) => (
              <label key={transfer.id} className={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  checked={transferTypes[transfer.id] || false}
                  onChange={() => handleTransferTypeChange(transfer.id)}
                />
                <span>{transfer.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
} 