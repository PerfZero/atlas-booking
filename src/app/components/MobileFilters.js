'use client';
import { useState } from 'react';
import styles from './MobileFilters.module.css';

export default function MobileFilters({ 
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
  availableTransfers = [],
  isOpen,
  onClose,
  onApply
}) {
  const [localPriceRange, setLocalPriceRange] = useState(priceRange);
  const [localFlightTypes, setLocalFlightTypes] = useState(flightTypes);
  const [localTicketTypes, setLocalTicketTypes] = useState(ticketTypes);
  const [localMekkaHotels, setLocalMekkaHotels] = useState(mekkaHotels);
  const [localMedinaHotels, setLocalMedinaHotels] = useState(medinaHotels);
  const [localMekkaDistance, setLocalMekkaDistance] = useState(mekkaDistance);
  const [localMedinaDistance, setLocalMedinaDistance] = useState(medinaDistance);
  const [localFoodTypes, setLocalFoodTypes] = useState(foodTypes);
  const [localTransferTypes, setLocalTransferTypes] = useState(transferTypes);

  const handleMinPriceChange = (e) => {
    const value = parseInt(e.target.value);
    setLocalPriceRange(prev => ({
      ...prev,
      min: Math.min(value, prev.max - 100)
    }));
  };

  const handleMaxPriceChange = (e) => {
    const value = parseInt(e.target.value);
    setLocalPriceRange(prev => ({
      ...prev,
      max: Math.max(value, prev.min + 100)
    }));
  };

  const handleFlightTypeChange = (type) => {
    setLocalFlightTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleTicketTypeChange = (type) => {
    setLocalTicketTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleMekkaHotelChange = (type) => {
    setLocalMekkaHotels(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleMedinaHotelChange = (type) => {
    setLocalMedinaHotels(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleMekkaDistanceChange = (bound, value) => {
    const numValue = parseInt(value) || 0;
    setLocalMekkaDistance(prev => ({
      ...prev,
      [bound]: numValue
    }));
  };

  const handleMedinaDistanceChange = (bound, value) => {
    const numValue = parseInt(value) || 0;
    setLocalMedinaDistance(prev => ({
      ...prev,
      [bound]: numValue
    }));
  };

  const handleFoodTypeChange = (type) => {
    setLocalFoodTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleTransferTypeChange = (type) => {
    setLocalTransferTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleApply = () => {
    setPriceRange(localPriceRange);
    setFlightTypes(localFlightTypes);
    setTicketTypes(localTicketTypes);
    setMekkaHotels(localMekkaHotels);
    setMedinaHotels(localMedinaHotels);
    setMekkaDistance(localMekkaDistance);
    setMedinaDistance(localMedinaDistance);
    setFoodTypes(localFoodTypes);
    setTransferTypes(localTransferTypes);
    onApply();
    onClose();
  };

  const handleReset = () => {
    const defaultPriceRange = { min: 890, max: 4500 };
    const defaultFlightTypes = { direct: false, transfer: false };
    const defaultTicketTypes = { economy: false, business: false };
    const defaultMekkaHotels = { five: false, four: false, three: false };
    const defaultMedinaHotels = { five: false, four: false, three: false };
    const defaultMekkaDistance = { min: 0, max: 4000 };
    const defaultMedinaDistance = { min: 0, max: 4000 };
    const defaultFoodTypes = { noFood: false, breakfast: false, halfBoard: false, allInclusive: false };
    const defaultTransferTypes = { bus: false, train: false, gmc: false };

    setLocalPriceRange(defaultPriceRange);
    setLocalFlightTypes(defaultFlightTypes);
    setLocalTicketTypes(defaultTicketTypes);
    setLocalMekkaHotels(defaultMekkaHotels);
    setLocalMedinaHotels(defaultMedinaHotels);
    setLocalMekkaDistance(defaultMekkaDistance);
    setLocalMedinaDistance(defaultMedinaDistance);
    setLocalFoodTypes(defaultFoodTypes);
    setLocalTransferTypes(defaultTransferTypes);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>Фильтры</h3>
          <button className={styles.closeButton} onClick={onClose}>✕</button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Стоимость тура</h4>
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
                    value={localPriceRange.min}
                    onChange={handleMinPriceChange}
                    className={styles.rangeInput}
                  />
                  <input 
                    type="range" 
                    min={minPrice} 
                    max={maxPrice} 
                    value={localPriceRange.max}
                    onChange={handleMaxPriceChange}
                    className={styles.rangeInput}
                  />
                </div>
              </div>
              <div className={styles.priceInputs}>
                <span className={styles.priceValue}>{localPriceRange.min}$</span>
                <span>-</span>
                <span className={styles.priceValue}>{localPriceRange.max}$</span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Перелет</h4>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Тип рейса:</label>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={localFlightTypes.direct}
                    onChange={() => handleFlightTypeChange('direct')}
                  />
                  <span>Прямой</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={localFlightTypes.transfer}
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
                    checked={localTicketTypes.economy}
                    onChange={() => handleTicketTypeChange('economy')}
                  />
                  <span>Эконом</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={localTicketTypes.business}
                    onChange={() => handleTicketTypeChange('business')}
                  />
                  <span>Бизнес-класс</span>
                </label>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Отель в Мекке</h4>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Уровень отеля:</label>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={localMekkaHotels.five}
                    onChange={() => handleMekkaHotelChange('five')}
                  />
                  <span>5 звезд</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={localMekkaHotels.four}
                    onChange={() => handleMekkaHotelChange('four')}
                  />
                  <span>4 звезды</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={localMekkaHotels.three}
                    onChange={() => handleMekkaHotelChange('three')}
                  />
                  <span>3 звезды</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={localMekkaHotels.two}
                    onChange={() => handleMekkaHotelChange('two')}
                  />
                  <span>2 звезды</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={localMekkaHotels.one}
                    onChange={() => handleMekkaHotelChange('one')}
                  />
                  <span>1 звезда</span>
                </label>
              </div>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Расстояние до Каабы:</label>
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
                      value={localMekkaDistance.min}
                      onChange={(e) => handleMekkaDistanceChange('min', e.target.value)}
                      className={styles.rangeInput}
                    />
                    <input 
                      type="range" 
                      min={minMekkaDistance} 
                      max={maxMekkaDistance} 
                      value={localMekkaDistance.max}
                      onChange={(e) => handleMekkaDistanceChange('max', e.target.value)}
                      className={styles.rangeInput}
                    />
                  </div>
                </div>
                <div className={styles.distanceInputs}>
                  <span className={styles.distanceValue}>{localMekkaDistance.min}м</span>
                  <span>-</span>
                  <span className={styles.distanceValue}>{localMekkaDistance.max}м</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Отель в Медине</h4>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Уровень отеля:</label>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={localMedinaHotels.five}
                    onChange={() => handleMedinaHotelChange('five')}
                  />
                  <span>5 звезд</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={localMedinaHotels.four}
                    onChange={() => handleMedinaHotelChange('four')}
                  />
                  <span>4 звезды</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={localMedinaHotels.three}
                    onChange={() => handleMedinaHotelChange('three')}
                  />
                  <span>3 звезды</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={localMedinaHotels.two}
                    onChange={() => handleMedinaHotelChange('two')}
                  />
                  <span>2 звезды</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={localMedinaHotels.one}
                    onChange={() => handleMedinaHotelChange('one')}
                  />
                  <span>1 звезда</span>
                </label>
              </div>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Расстояние до мечети:</label>
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
                      value={localMedinaDistance.min}
                      onChange={(e) => handleMedinaDistanceChange('min', e.target.value)}
                      className={styles.rangeInput}
                    />
                    <input 
                      type="range" 
                      min={minMedinaDistance} 
                      max={maxMedinaDistance} 
                      value={localMedinaDistance.max}
                      onChange={(e) => handleMedinaDistanceChange('max', e.target.value)}
                      className={styles.rangeInput}
                    />
                  </div>
                </div>
                <div className={styles.distanceInputs}>
                  <span className={styles.distanceValue}>{localMedinaDistance.min}м</span>
                  <span>-</span>
                  <span className={styles.distanceValue}>{localMedinaDistance.max}м</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Общее</h4>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Питание:</label>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={localFoodTypes.noFood}
                    onChange={() => handleFoodTypeChange('noFood')}
                  />
                  <span>Без питания</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={localFoodTypes.breakfast}
                    onChange={() => handleFoodTypeChange('breakfast')}
                  />
                  <span>Только завтрак</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={localFoodTypes.halfBoard}
                    onChange={() => handleFoodTypeChange('halfBoard')}
                  />
                  <span>Завтрак и ужин</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={localFoodTypes.allInclusive}
                    onChange={() => handleFoodTypeChange('allInclusive')}
                  />
                  <span>Всё включено</span>
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
                      checked={localTransferTypes[transfer.id] || false}
                      onChange={() => handleTransferTypeChange(transfer.id)}
                    />
                    <span>{transfer.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.resetButton} onClick={handleReset}>
            Сбросить
          </button>
          <button className={styles.applyButton} onClick={handleApply}>
            Применить
          </button>
        </div>
      </div>
    </>
  );
}
