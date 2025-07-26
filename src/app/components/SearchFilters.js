import { useState } from 'react';
import styles from '../search/page.module.css';

export default function SearchFilters({ 
  priceRange, 
  setPriceRange, 
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
  medinaDistance, 
  setMedinaDistance, 
  foodTypes, 
  setFoodTypes, 
  transferTypes, 
  setTransferTypes 
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
                min="890" 
                max="4500" 
                value={priceRange.min}
                onChange={handleMinPriceChange}
                className={styles.rangeInput}
                id="minPrice"
              />
              <input 
                type="range" 
                min="890" 
                max="4500" 
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
                  min="0" 
                  max="4000" 
                  value={mekkaDistance.min}
                  onChange={(e) => handleMekkaDistanceChange('min', e.target.value)}
                  className={styles.rangeInput}
                  id="mekkaMinDistance"
                />
                <input 
                  type="range" 
                  min="0" 
                  max="4000" 
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
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Тип номера:</label>
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" />
              <span>С видом на Каабу</span>
            </label>
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
                  min="0" 
                  max="4000" 
                  value={medinaDistance.min}
                  onChange={(e) => handleMedinaDistanceChange('min', e.target.value)}
                  className={styles.rangeInput}
                  id="medinaMinDistance"
                />
                <input 
                  type="range" 
                  min="0" 
                  max="4000" 
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
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Тип номера:</label>
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" />
              <span>С видом на мечеть</span>
            </label>
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
                checked={foodTypes.noFood}
                onChange={() => handleFoodTypeChange('noFood')}
              />
              <span>Без питания</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={foodTypes.breakfast}
                onChange={() => handleFoodTypeChange('breakfast')}
              />
              <span>Только завтрак</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={foodTypes.halfBoard}
                onChange={() => handleFoodTypeChange('halfBoard')}
              />
              <span>Завтрак и ужин</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={foodTypes.allInclusive}
                onChange={() => handleFoodTypeChange('allInclusive')}
              />
              <span>Всё включено</span>
            </label>
          </div>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Трансфер:</label>
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={transferTypes.bus}
                onChange={() => handleTransferTypeChange('bus')}
              />
              <span>Комфортабельный автобус</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={transferTypes.train}
                onChange={() => handleTransferTypeChange('train')}
              />
              <span>Высокоскоростной поезд</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={transferTypes.gmc}
                onChange={() => handleTransferTypeChange('gmc')}
              />
              <span>Личный транспорт GMC</span>
            </label>
          </div>
        </div>
      </div>
    </aside>
  );
} 