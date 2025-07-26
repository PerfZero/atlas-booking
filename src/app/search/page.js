'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchForm from '../components/SearchForm';
import Breadcrumbs from '../components/Breadcrumbs';
import styles from './page.module.css';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const [filteredResults, setFilteredResults] = useState([]);
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState({ min: 890, max: 4500 });
  const [flightTypes, setFlightTypes] = useState({ direct: true, transfer: false });
  const [ticketTypes, setTicketTypes] = useState({ economy: false, business: false });
  const [mekkaHotels, setMekkaHotels] = useState({ five: true, four: false, three: false });
  const [medinaHotels, setMedinaHotels] = useState({ five: false, four: false, three: false });
  const [mekkaDistance, setMekkaDistance] = useState({ min: 0, max: 4000 });
  const [medinaDistance, setMedinaDistance] = useState({ min: 0, max: 4000 });
  const [foodTypes, setFoodTypes] = useState({ noFood: false, breakfast: false, halfBoard: false, allInclusive: true });
  const [transferTypes, setTransferTypes] = useState({ bus: true, train: false, gmc: false });

  const breadcrumbItems = [
    { label: 'Главная', href: '/' },
    { label: 'Результат поиска' }
  ];

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

  const allSearchResults = [
    {
      id: 1,
      name: "Fairmont Package",
      price: "2 400 $",
      priceValue: 2400,
      oldPrice: "2 500 $",
      duration: "3 дня в Медине · 3 дня в Мекке",
      departure: "Алматы",
      departureValue: "almaty",
      date: "15 января 2024",
      dateValue: "january",
      type: "Умра",
      typeValue: "umrah",
      image: "/tour_1.png",
      rating: 9.3,
      reviews: 124,
      spotsLeft: 9,
      features: ["Всё включено", "Прямой рейс", "5* отель в Мекке", "Расстояние до Каабы 50 м.", "5* отель в Медине", "Расстояние до мечети 150 м."],
      tags: ["Умра", "Возможен номер с видом на Каабу"]
    },
    {
      id: 2,
      name: "Address Package",
      price: "2 200 $",
      priceValue: 2200,
      oldPrice: "2 300 $",
      duration: "3 дня в Медине · 3 дня в Мекке",
      departure: "Астана",
      departureValue: "astana",
      date: "20 января 2024",
      dateValue: "january",
      type: "Умра",
      typeValue: "umrah",
      image: "/tour_2.png",
      rating: 9.1,
      reviews: 89,
      spotsLeft: 12,
      features: ["Всё включено", "Прямой рейс", "5* отель в Мекке", "Расстояние до Каабы 100 м.", "4* отель в Медине", "Расстояние до мечети 200 м."],
      tags: ["Умра"]
    },
    {
      id: 3,
      name: "Swissotel Package",
      price: "2 800 $",
      priceValue: 2800,
      oldPrice: "3 000 $",
      duration: "3 дня в Медине · 3 дня в Мекке",
      departure: "Алматы",
      departureValue: "almaty",
      date: "25 января 2024",
      dateValue: "january",
      type: "Умра",
      typeValue: "umrah",
      image: "/tour_3.png",
      rating: 9.5,
      reviews: 156,
      spotsLeft: 5,
      features: ["Всё включено", "Прямой рейс", "5* отель в Мекке", "Расстояние до Каабы 30 м.", "5* отель в Медине", "Расстояние до мечети 100 м."],
      tags: ["Умра", "Премиум"]
    },
    {
      id: 4,
      name: "Marriott Package",
      price: "2 100 $",
      priceValue: 2100,
      oldPrice: "2 200 $",
      duration: "3 дня в Медине · 3 дня в Мекке",
      departure: "Шымкент",
      departureValue: "shymkent",
      date: "30 января 2024",
      dateValue: "january",
      type: "Умра",
      typeValue: "umrah",
      image: "/tour_4.png",
      rating: 8.9,
      reviews: 67,
      spotsLeft: 15,
      features: ["Всё включено", "С пересадкой", "4* отель в Мекке", "Расстояние до Каабы 200 м.", "4* отель в Медине", "Расстояние до мечети 300 м."],
      tags: ["Умра", "Эконом"]
    }
  ];

  useEffect(() => {
    let results = [...allSearchResults];

    const departureCity = searchParams.get('departureCity');
    const travelDate = searchParams.get('travelDate');
    const pilgrimageType = searchParams.get('pilgrimageType');

    if (departureCity && departureCity !== 'almaty') {
      results = results.filter(tour => tour.departureValue === departureCity);
    }

    if (travelDate && travelDate !== 'not-specified') {
      results = results.filter(tour => tour.dateValue === travelDate);
    }

    if (pilgrimageType && pilgrimageType !== 'umrah') {
      results = results.filter(tour => tour.typeValue === pilgrimageType);
    }

    results = results.filter(tour => 
      tour.priceValue >= priceRange.min && tour.priceValue <= priceRange.max
    );

    switch (sortBy) {
      case 'price-low':
        results.sort((a, b) => a.priceValue - b.priceValue);
        break;
      case 'price-high':
        results.sort((a, b) => b.priceValue - a.priceValue);
        break;
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      default:
        results.sort((a, b) => b.reviews - a.reviews);
    }

    setFilteredResults(results);
  }, [searchParams, sortBy, priceRange, flightTypes, ticketTypes, mekkaHotels, medinaHotels, mekkaDistance, medinaDistance, foodTypes, transferTypes]);

  return (
    <div className={styles.page}>
      <Header invertLogo={true} buttonStyle="search" />
      
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.titleSection}>
              <h1 className={styles.title}>Умра в 3 клика. Вместе с Atlas Tourism.</h1>
            </div>
            
            <div className={styles.searchFormWrapper}>
              <SearchForm className={styles.searchForm} />
            </div>
          </div>
          <Breadcrumbs items={breadcrumbItems} />

          <div className={styles.content}>
            
            <div className={styles.leftColumn}>
            
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
            </div>

            <div className={styles.rightColumn}>
              <section className={styles.results}>
                <div className={styles.resultsHeader}>
                  <h3 className={styles.resultsTitle}>Результаты поиска. Найдено {filteredResults.length} варианта</h3>
                  <div className={styles.sortWrapper}>
                    <select 
                      className={styles.sortSelect}
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="popular">Сортировка не выбрана</option>
                      <option value="price-low">По цене (сначала дешевые)</option>
                      <option value="price-high">По цене (сначала дорогие)</option>
                      <option value="rating">По рейтингу</option>
                    </select>
                  </div>
                </div>

                <div className={styles.tourCards}>
                  {filteredResults.length > 0 ? (
                    filteredResults.map((tour) => (
                                             <div key={tour.id} className={styles.tourCard}>
                         <div className={styles.tourImage}>
                           <div className={styles.cardBadge}>
                             <span className={styles.badgeIcon}><img src="/chos.svg" alt="★" /></span>
                             <span>Выбор паломников</span>
                           </div>
                           <img src={tour.image} alt={tour.name} />
                           <div className={styles.imageOverlay}>
                             <div className={styles.tourTags}>
                               {tour.tags.map((tag, index) => (
                                 <span key={index} className={styles.tag}>{tag}</span>
                               ))}
                             </div>
                             <h4 className={styles.tourName}>{tour.name}</h4>
                             <div className={styles.externalIcon}>
                             <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M10.7481 8.26334L10.7414 1.52675C10.7414 1.14505 10.4936 0.877197 10.0918 0.877197H3.35519C2.98019 0.877197 2.72572 1.16514 2.72572 1.48657C2.72572 1.808 3.01367 2.08255 3.3284 2.08255H5.65876L8.92662 1.97541L7.68108 3.06693L1.04492 9.71648C0.924386 9.83699 0.857422 9.99105 0.857422 10.1384C0.857422 10.4598 1.14537 10.7611 1.48019 10.7611C1.63421 10.7611 1.78153 10.7076 1.90206 10.5803L8.55159 3.93746L9.65651 2.68523L9.53599 5.81247V8.29014C9.53599 8.60488 9.81057 8.89951 10.1387 8.89951C10.4601 8.89951 10.7481 8.62499 10.7481 8.26334Z" fill="#253168" />
</svg>
                             </div>
                           </div>
                         </div>
                         
                         <div className={styles.tourContent}>
                           <div className={styles.contentHeader}>
                             <h4 className={styles.tourDuration}>{tour.duration}</h4>
                             <div className={styles.tourRating}>
                               <div className={styles.ratingCircle}>
                                 <span>{tour.rating}</span>
                               </div>
                             </div>
                           </div>
                           
                           <div className={styles.featureButtons}>
                             <div className={styles.allInclusiveBtn}>
                               <span className={styles.featureIcon}><img src="/all.svg" alt="★" /></span>
                               <span>Всё включено</span>
                             </div>
                             {tour.spotsLeft && (
                               <div className={styles.spotsLeft}>
                                 <span className={styles.spotsIcon}><img src="/alert.svg" alt="★" /></span>
                                 <span>Осталось {tour.spotsLeft} мест</span>
                               </div>
                             )}
                           </div>
                           
                           <div className={styles.tourFeatures}>
                             <div className={styles.feature}>
                               <span className={styles.featureIcon}><img src="/airplane.svg" alt="★" /></span>
                               <span className={styles.featureText}>Прямой рейс</span>
                             </div>
                             <div className={styles.feature}>
                               <span className={styles.featureIcon}><img src="/mekka.svg" alt="★" /></span>
                               <span className={styles.featureText}>5* отель в Мекке</span>
                             </div>
                             <div className={styles.feature}>
                               <span className={styles.featureIcon}><img src="/location.svg" alt="★" /></span>
                               <span className={styles.featureText}>Расстояние до Каабы 50 м.</span>
                             </div>
                             <div className={styles.feature}>
                               <span className={styles.featureIcon}><img src="/medina.svg" alt="★" /></span>
                               <span className={styles.featureText}>5* отель в Медине</span>
                             </div>
                             <div className={styles.feature}>
                               <span className={styles.featureIcon}>📍</span>
                               <span className={styles.featureText}>Расстояние до мечети 150 м.</span>
                             </div>
                           </div>
                           
                           <div className={styles.tourPrice}>
                             <div className={styles.priceNote}>Без скрытых платежей</div>
                             <div className={styles.priceInfo}>
                               <span className={styles.currentPrice}>От ${tour.price.replace(' $', '')}</span>
                               {tour.oldPrice && (
                                 <span className={styles.oldPrice}>{tour.oldPrice}</span>
                               )}
                             </div>
                             <div className={styles.priceEquivalent}>~1 312 500T</div>
                           </div>
                           
                           <button className={styles.viewOptionsBtn}>Посмотреть варианты</button>
                         </div>
                       </div>
                    ))
                  ) : (
                    <div className={styles.noResults}>
                      <h3>Туры не найдены</h3>
                      <p>Попробуйте изменить параметры поиска</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  );
} 