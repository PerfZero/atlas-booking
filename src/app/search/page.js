'use client';
import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchToursWithFilters, getTransfers } from '../../lib/wordpress-api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchFormWithParams from '../components/SearchForm';
import Breadcrumbs from '../components/Breadcrumbs';
import styles from './page.module.css';
import TourCard from '../components/TourCard';
import TourCardSkeleton from '../components/TourCardSkeleton';
import SearchFilters from '../components/SearchFilters';
import MobileFilters from '../components/MobileFilters';
import CustomSortSelect from '../components/CustomSortSelect';
import BottomNavigation from '../components/BottomNavigation';
import MobileSort from '../components/MobileSort';

function SearchPageWithParams() {
  const searchParams = useSearchParams();
  
  return <SearchPageContent searchParams={searchParams} />;
}

function SearchPageContent({ searchParams }) {
  const [filteredResults, setFilteredResults] = useState([]);
  const [allTours, setAllTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [minTourPrice, setMinTourPrice] = useState(0);
  const [maxTourPrice, setMaxTourPrice] = useState(3000);
  const [minMekkaDistance, setMinMekkaDistance] = useState(0);
  const [maxMekkaDistance, setMaxMekkaDistance] = useState(4000);
  const [minMedinaDistance, setMinMedinaDistance] = useState(0);
  const [maxMedinaDistance, setMaxMedinaDistance] = useState(4000);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 3000 });
  const [availableTransfers, setAvailableTransfers] = useState([]);
  const [flightTypes, setFlightTypes] = useState({ direct: true, transfer: false });
  const [ticketTypes, setTicketTypes] = useState({ economy: false, business: false, first: false });
  const [mekkaHotels, setMekkaHotels] = useState({ five: false, four: false, three: false });
  const [medinaHotels, setMedinaHotels] = useState({ five: false, four: false, three: false });
  const [mekkaDistance, setMekkaDistance] = useState({ min: 0, max: 4000 });
  const [medinaDistance, setMedinaDistance] = useState({ min: 0, max: 4000 });
  const [foodTypes, setFoodTypes] = useState({ BB: false, HB: false, FB: false, AI: false });
  const [transferTypes, setTransferTypes] = useState({});
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);

  const breadcrumbItems = [
    { label: 'Главная', href: '/' },
    { label: 'Результат поиска' }
  ];

  const loadTours = useCallback(async () => {
    setLoading(true);
    try {
      const departureCity = searchParams.get('departureCity');
      const pilgrimageType = searchParams.get('pilgrimageType');
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      
      // Сначала получаем все туры без фильтрации по цене
      const filters = {
        departureCity,
        pilgrimageType,
        startDate,
        endDate,
        sortBy
      };
      
      const result = await searchToursWithFilters(filters);
      
      
      if (result.success && result.tours) {
        // Применяем фильтры на фронтенде
        let filteredTours = result.tours;
        
        // Сортировка
        if (sortBy) {
          switch (sortBy) {
            case 'price-low':
              filteredTours.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
              break;
            case 'price-high':
              filteredTours.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
              break;
            case 'rating':
              filteredTours.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
              break;
          }
        }
        
        setAllTours(filteredTours);
        setFilteredResults(filteredTours);
      } else {
        setAllTours([]);
        setFilteredResults([]);
      }
    } catch (error) {
      console.error('Ошибка загрузки туров:', error);
      setFilteredResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams, sortBy]);

  useEffect(() => {
    loadTours();
  }, [searchParams, sortBy, loadTours]);

  useEffect(() => {
    const loadTransfers = async () => {
      try {
        const API_URL = 'https://api.booking.atlas.kz/wp-json';
        const response = await fetch(`${API_URL}/atlas-hajj/v1/transfers`);
        const transfers = await response.json();
        setAvailableTransfers(transfers || []);
      } catch (error) {
        console.error('Ошибка загрузки трансферов:', error);
        setAvailableTransfers([]);
      }
    };
    loadTransfers();
  }, []);

  useEffect(() => {
    if (allTours.length > 0) {
      const prices = allTours.map(tour => parseFloat(tour.price) || 0);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      setMinTourPrice(minPrice);
      setMaxTourPrice(maxPrice);
      
      if (priceRange.max === 3000) {
        setPriceRange({
          min: minPrice,
          max: maxPrice
        });
      }
      
      // Вычисляем минимальные и максимальные расстояния
      const mekkaDistances = allTours
        .map(tour => {
          const distance = tour.hotel_mekka?.distance_number;
          if (!distance) return 0;
          // Убираем единицы измерения и парсим число
          return parseFloat(String(distance).replace(/[^\d.]/g, '')) || 0;
        })
        .filter(d => d > 0);
      const medinaDistances = allTours
        .map(tour => {
          const distance = tour.hotel_medina?.distance_number;
          if (!distance) return 0;
          // Убираем единицы измерения и парсим число
          return parseFloat(String(distance).replace(/[^\d.]/g, '')) || 0;
        })
        .filter(d => d > 0);
      
      const minMekka = mekkaDistances.length > 0 ? Math.min(...mekkaDistances) : 0;
      const maxMekka = mekkaDistances.length > 0 ? Math.max(...mekkaDistances) : 4000;
      const minMedina = medinaDistances.length > 0 ? Math.min(...medinaDistances) : 0;
      const maxMedina = medinaDistances.length > 0 ? Math.max(...medinaDistances) : 4000;
      
      setMinMekkaDistance(minMekka);
      setMaxMekkaDistance(maxMekka);
      setMinMedinaDistance(minMedina);
      setMaxMedinaDistance(maxMedina);
      
      if (mekkaDistance.max === 4000) {
        setMekkaDistance({ min: minMekka, max: maxMekka });
      }
      
      if (medinaDistance.max === 4000) {
        setMedinaDistance({ min: minMedina, max: maxMedina });
      }
    }
  }, [allTours]);

  // Отдельный useEffect для фильтрации с дебаунсом
  useEffect(() => {
    setFiltering(true);
    
    const timeoutId = setTimeout(() => {
      if (allTours.length > 0) {
        let filtered = allTours.filter(tour => {
          // Фильтр по цене
          const price = parseFloat(tour.price) || 0;
          const priceMatch = price >= priceRange.min && price <= priceRange.max;
          
          // Фильтр по типу перелета
          let flightMatch = true;
          if (flightTypes.direct && !flightTypes.transfer) {
            // Только прямые рейсы
            flightMatch = tour.flight_type === 'direct';
          } else if (flightTypes.transfer && !flightTypes.direct) {
            // Только с пересадкой
            flightMatch = tour.flight_type === 'transfer';
          } else if (!flightTypes.direct && !flightTypes.transfer) {
            // Ничего не выбрано - не показываем туры
            flightMatch = false;
          }
          
          // Фильтр по типу билета
          let ticketMatch = true;
          if (ticketTypes.economy || ticketTypes.business || ticketTypes.first) {
            // Если выбраны какие-то типы билетов, проверяем соответствие
            const hasMatchingTicketType = () => {
              const selectedTypes = [];
              if (ticketTypes.economy) selectedTypes.push('economy');
              if (ticketTypes.business) selectedTypes.push('business');
              if (ticketTypes.first) selectedTypes.push('first');
              
              const tourTicketTypes = [];
              // Собираем все типы билетов в туре
              if (tour.flight_outbound && tour.flight_outbound.ticket_type) {
                tourTicketTypes.push(tour.flight_outbound.ticket_type);
              }
              if (tour.flight_inbound && tour.flight_inbound.ticket_type) {
                tourTicketTypes.push(tour.flight_inbound.ticket_type);
              }
              
              // Проверяем, что хотя бы один выбранный тип присутствует в туре
              return selectedTypes.some(selectedType => tourTicketTypes.includes(selectedType));
            };
            ticketMatch = hasMatchingTicketType();
          } else {
            // Если ничего не выбрано, показываем все туры
            ticketMatch = true;
          }
          
          // Фильтр по типу питания (проверяем meal_plan отелей)
          let foodMatch = true;
          if (Object.values(foodTypes).some(selected => selected)) {
            // Если выбраны какие-то типы питания, проверяем соответствие
            const selectedFoodTypes = Object.keys(foodTypes).filter(key => foodTypes[key]);
            
            // Собираем все типы питания из отелей тура
            const tourMealPlans = [];
            if (tour.hotel_mekka_details && tour.hotel_mekka_details.meal_plan) {
              tourMealPlans.push(tour.hotel_mekka_details.meal_plan);
            }
            if (tour.hotel_medina_details && tour.hotel_medina_details.meal_plan) {
              tourMealPlans.push(tour.hotel_medina_details.meal_plan);
            }
            
            // Проверяем, что хотя бы один выбранный тип присутствует в отелях тура
            foodMatch = selectedFoodTypes.some(selectedType => tourMealPlans.includes(selectedType));
          } else {
            // Если ничего не выбрано, показываем все туры
            foodMatch = true;
          }
          
          // Фильтр по трансферам
          let transferMatch = true;
          if (Object.values(transferTypes).some(selected => selected)) {
            const selectedTransferIds = Object.keys(transferTypes).filter(key => transferTypes[key]).map(id => parseInt(id));
            
            const tourTransferIds = [];
            if (tour.transfers && Array.isArray(tour.transfers)) {
              tour.transfers.forEach(transfer => {
                if (transfer.id) {
                  tourTransferIds.push(transfer.id);
                }
              });
            }
            
            transferMatch = selectedTransferIds.some(selectedId => tourTransferIds.includes(selectedId));
          }
          
          // Фильтр по отелям в Мекке
          let mekkaHotelMatch = true;
          if (Object.values(mekkaHotels).some(selected => selected)) {
            const selectedStars = Object.keys(mekkaHotels).filter(key => mekkaHotels[key]);
            const starMap = { five: '5', four: '4', three: '3', two: '2', one: '1' };
            const tourMekkaStars = tour.hotel_mekka_details?.stars;
            
            mekkaHotelMatch = selectedStars.some(key => starMap[key] === tourMekkaStars);
          }
          
          // Фильтр по отелям в Медине
          let medinaHotelMatch = true;
          if (Object.values(medinaHotels).some(selected => selected)) {
            const selectedStars = Object.keys(medinaHotels).filter(key => medinaHotels[key]);
            const starMap = { five: '5', four: '4', three: '3', two: '2', one: '1' };
            const tourMedinaStars = tour.hotel_medina_details?.stars;
            
            medinaHotelMatch = selectedStars.some(key => starMap[key] === tourMedinaStars);
          }
          
          // Фильтр по расстоянию отеля в Мекке
          let mekkaDistanceMatch = true;
          if (mekkaDistance.min !== minMekkaDistance || mekkaDistance.max !== maxMekkaDistance) {
            const distanceStr = tour.hotel_mekka?.distance_number;
            if (distanceStr) {
              // Убираем единицы измерения и парсим число
              const distance = parseFloat(String(distanceStr).replace(/[^\d.]/g, '')) || 0;
              mekkaDistanceMatch = distance >= mekkaDistance.min && distance <= mekkaDistance.max;
            } else {
              mekkaDistanceMatch = false;
            }
          }
          
          // Фильтр по расстоянию отеля в Медине
          let medinaDistanceMatch = true;
          if (medinaDistance.min !== minMedinaDistance || medinaDistance.max !== maxMedinaDistance) {
            const distanceStr = tour.hotel_medina?.distance_number;
            if (distanceStr) {
              // Убираем единицы измерения и парсим число
              const distance = parseFloat(String(distanceStr).replace(/[^\d.]/g, '')) || 0;
              medinaDistanceMatch = distance >= medinaDistance.min && distance <= medinaDistance.max;
            } else {
              medinaDistanceMatch = false;
            }
          }
          
          // Отладочная информация
          console.log('Tour:', tour.name, {
            priceMatch,
            flightMatch,
            ticketMatch,
            foodMatch,
            transferMatch,
            mekkaHotelMatch,
            medinaHotelMatch,
            mekkaDistanceMatch,
            medinaDistanceMatch,
            flightType: tour.flight_type,
            mealPlans: {
              mekka: tour.hotel_mekka_details?.meal_plan,
              medina: tour.hotel_medina_details?.meal_plan
            },
            hotelStars: {
              mekka: tour.hotel_mekka_details?.stars,
              medina: tour.hotel_medina_details?.stars
            },
            hotelDistances: {
              mekka: tour.hotel_mekka?.distance_number,
              medina: tour.hotel_medina?.distance_number
            },
            transfers: tour.transfers,
            ticketTypes: {
              outbound: tour.flight_outbound?.ticket_type,
              inbound: tour.flight_inbound?.ticket_type
            },
            selectedFlightTypes: flightTypes,
            selectedTicketTypes: ticketTypes,
            selectedFoodTypes: foodTypes,
            selectedTransferTypes: transferTypes
          });
          
          return priceMatch && flightMatch && ticketMatch && foodMatch && transferMatch && 
                 mekkaHotelMatch && medinaHotelMatch && mekkaDistanceMatch && medinaDistanceMatch;
        });
        setFilteredResults(filtered);
      }
      setFiltering(false);
    }, 500); // 500ms задержка

    return () => clearTimeout(timeoutId);
  }, [priceRange.min, priceRange.max, flightTypes, ticketTypes, foodTypes, transferTypes, 
      mekkaHotels, medinaHotels, mekkaDistance, medinaDistance, allTours]);

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
              <Suspense fallback={<div>Loading...</div>}>
                <SearchFormWithParams className={styles.searchForm} isHomePage={false} />
              </Suspense>
            </div>
          </div>
          <div className={styles.wrap}>       
                   <Breadcrumbs items={breadcrumbItems} />
              </div>
          <div className={styles.content}>
            
            <div className={styles.leftColumn}>
              <SearchFilters 
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                minPrice={minTourPrice}
                maxPrice={maxTourPrice}
                flightTypes={flightTypes}
                setFlightTypes={setFlightTypes}
                ticketTypes={ticketTypes}
                setTicketTypes={setTicketTypes}
                mekkaHotels={mekkaHotels}
                setMekkaHotels={setMekkaHotels}
                medinaHotels={medinaHotels}
                setMedinaHotels={setMedinaHotels}
                mekkaDistance={mekkaDistance}
                setMekkaDistance={setMekkaDistance}
                minMekkaDistance={minMekkaDistance}
                maxMekkaDistance={maxMekkaDistance}
                medinaDistance={medinaDistance}
                setMedinaDistance={setMedinaDistance}
                minMedinaDistance={minMedinaDistance}
                maxMedinaDistance={maxMedinaDistance}
                foodTypes={foodTypes}
                setFoodTypes={setFoodTypes}
                transferTypes={transferTypes}
                setTransferTypes={setTransferTypes}
                availableTransfers={availableTransfers}
              />
            </div>

            <div className={styles.rightColumn}>
              <section className={styles.results}>
                <div className={styles.resultsHeader}>
                  <div className={styles.resultsHeaderTop}>
                    <h3 className={styles.resultsTitle}>Результаты поиска. Найдено {filteredResults.length} варианта</h3>
                    <div className={styles.mobileButtons}>
                      <button 
                        className={styles.mobileSortButton}
                        onClick={() => setMobileSortOpen(true)}
                      >
                        <img src="/sort.svg" alt="Сортировка" />
                        Сортировка
                      </button>
                      <button 
                        className={styles.mobileFiltersButton}
                        onClick={() => setMobileFiltersOpen(true)}
                      >
                        <img src="/sort.svg" alt="Фильтры" />
                        Фильтры
                      </button>
                    </div>
                  </div>
                  <div className={styles.sortWrapper}>
                    <CustomSortSelect
                      value={sortBy}
                      onChange={setSortBy}
                      options={[
                        { value: 'popular', label: 'Сортировка не выбрана' },
                        { value: 'price-low', label: 'По цене (сначала дешевые)' },
                        { value: 'price-high', label: 'По цене (сначала дорогие)' },
                        { value: 'rating', label: 'По рейтингу' }
                      ]}
                    />
                  </div>
                </div>

                <div className={styles.tourCards}>
                  {loading || filtering ? (
                    <>
                      <TourCardSkeleton />
                      <TourCardSkeleton />
                      <TourCardSkeleton />
                    </>
                  ) : filteredResults.length > 0 ? (
                    filteredResults.map((tour) => (
                      <TourCard 
                        key={tour.id} 
                        tour={tour} 
                        searchParams={searchParams}
                      />
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
      <BottomNavigation />
      
      <MobileFilters
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        minPrice={minTourPrice}
        maxPrice={maxTourPrice}
        flightTypes={flightTypes}
        setFlightTypes={setFlightTypes}
        ticketTypes={ticketTypes}
        setTicketTypes={setTicketTypes}
        mekkaHotels={mekkaHotels}
        setMekkaHotels={setMekkaHotels}
        medinaHotels={medinaHotels}
        setMedinaHotels={setMedinaHotels}
        mekkaDistance={mekkaDistance}
        setMekkaDistance={setMekkaDistance}
        minMekkaDistance={minMekkaDistance}
        maxMekkaDistance={maxMekkaDistance}
        medinaDistance={medinaDistance}
        setMedinaDistance={setMedinaDistance}
        minMedinaDistance={minMedinaDistance}
        maxMedinaDistance={maxMedinaDistance}
        foodTypes={foodTypes}
        setFoodTypes={setFoodTypes}
        transferTypes={transferTypes}
        setTransferTypes={setTransferTypes}
        availableTransfers={availableTransfers}
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        onApply={() => {
          setMobileFiltersOpen(false);
          loadTours();
        }}
      />
      
      <MobileSort
        isOpen={mobileSortOpen}
        onClose={() => setMobileSortOpen(false)}
        value={sortBy}
        onChange={setSortBy}
        options={[
          { value: 'popular', label: 'Сортировка не выбрана' },
          { value: 'price-low', label: 'По цене (сначала дешевые)' },
          { value: 'price-high', label: 'По цене (сначала дорогие)' },
          { value: 'rating', label: 'По рейтингу' }
        ]}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPageWithParams />
    </Suspense>
  );
} 