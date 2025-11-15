'use client';
import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
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
  const [sortBy, setSortBy] = useState('popular');
  const [minTourPrice, setMinTourPrice] = useState(0);
  const [maxTourPrice, setMaxTourPrice] = useState(3000);
  const [minMekkaDistance, setMinMekkaDistance] = useState(0);
  const [maxMekkaDistance, setMaxMekkaDistance] = useState(4000);
  const [minMedinaDistance, setMinMedinaDistance] = useState(0);
  const [maxMedinaDistance, setMaxMedinaDistance] = useState(4000);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 3000 });
  const [availableTransfers, setAvailableTransfers] = useState([]);
  const [flightTypes, setFlightTypes] = useState({ direct: false, transfer: false });
  const [ticketTypes, setTicketTypes] = useState({ economy: false, business: false, first: false });
  const [mekkaHotels, setMekkaHotels] = useState({ five: false, four: false, three: false });
  const [medinaHotels, setMedinaHotels] = useState({ five: false, four: false, three: false });
  const [mekkaDistance, setMekkaDistance] = useState({ min: 0, max: 4000 });
  const [medinaDistance, setMedinaDistance] = useState({ min: 0, max: 4000 });
  const [foodTypes, setFoodTypes] = useState({ BB: false, HB: false, FB: false, AI: false });
  const [transferTypes, setTransferTypes] = useState({});
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const [priceRangeManuallySet, setPriceRangeManuallySet] = useState(false);
  const [shouldUpdatePriceBounds, setShouldUpdatePriceBounds] = useState(true);
  const filtersInitialized = useRef(false);
  const isAutoUpdatingPriceRange = useRef(false);

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
      
      const activeFlightType = flightTypes.direct && !flightTypes.transfer ? 'direct' : 
                               flightTypes.transfer && !flightTypes.direct ? 'transfer' : null;
      
      const activeTicketTypes = [];
      if (ticketTypes.economy) activeTicketTypes.push('economy');
      if (ticketTypes.business) activeTicketTypes.push('business');
      if (ticketTypes.first) activeTicketTypes.push('first');
      
      const activeFoodTypes = Object.keys(foodTypes).filter(key => foodTypes[key]);
      
      const activeTransferIds = Object.keys(transferTypes).filter(key => transferTypes[key]).map(id => parseInt(id));
      
      const activeMekkaStars = Object.keys(mekkaHotels).filter(key => mekkaHotels[key]).map(key => {
        const starMap = { five: '5', four: '4', three: '3', two: '2', one: '1' };
        return starMap[key];
      });
      
      const activeMedinaStars = Object.keys(medinaHotels).filter(key => medinaHotels[key]).map(key => {
        const starMap = { five: '5', four: '4', three: '3', two: '2', one: '1' };
        return starMap[key];
      });
      
      const minPriceFilter = priceRange.min > minTourPrice ? priceRange.min : null;
      const maxPriceFilter = priceRange.max < maxTourPrice ? priceRange.max : null;
      
      const filters = {
        departureCity,
        pilgrimageType,
        startDate,
        endDate,
        sortBy,
        minPrice: minPriceFilter,
        maxPrice: maxPriceFilter,
        flightType: activeFlightType,
        ticketTypes: activeTicketTypes.length > 0 ? activeTicketTypes : null,
        foodTypes: activeFoodTypes.length > 0 ? activeFoodTypes : null,
        transferIds: activeTransferIds.length > 0 ? activeTransferIds : null,
        mekkaHotelStars: activeMekkaStars.length > 0 ? activeMekkaStars : null,
        medinaHotelStars: activeMedinaStars.length > 0 ? activeMedinaStars : null,
        mekkaDistanceMin: mekkaDistance.min !== minMekkaDistance ? mekkaDistance.min : null,
        mekkaDistanceMax: mekkaDistance.max !== maxMekkaDistance ? mekkaDistance.max : null,
        medinaDistanceMin: medinaDistance.min !== minMedinaDistance ? medinaDistance.min : null,
        medinaDistanceMax: medinaDistance.max !== maxMedinaDistance ? medinaDistance.max : null
      };
      
      const result = await searchToursWithFilters(filters);
      
      if (result.success && result.tours) {
        setAllTours(result.tours);
        setFilteredResults(result.tours);
      } else {
        setAllTours([]);
        setFilteredResults([]);
      }
    } catch (error) {
      console.error('Ошибка загрузки туров:', error);
      setAllTours([]);
      setFilteredResults([]);
    } finally {
      setLoading(false);
    }
  }, [
    searchParams.get('departureCity'),
    searchParams.get('pilgrimageType'),
    searchParams.get('startDate'),
    searchParams.get('endDate'),
    sortBy, 
    priceRange.min, 
    priceRange.max, 
    flightTypes.direct, 
    flightTypes.transfer, 
    ticketTypes.economy, 
    ticketTypes.business, 
    ticketTypes.first, 
    foodTypes.BB, 
    foodTypes.HB, 
    foodTypes.FB, 
    foodTypes.AI, 
    JSON.stringify(transferTypes), 
    mekkaHotels.five, 
    mekkaHotels.four, 
    mekkaHotels.three, 
    medinaHotels.five, 
    medinaHotels.four, 
    medinaHotels.three, 
    mekkaDistance.min, 
    mekkaDistance.max, 
    medinaDistance.min, 
    medinaDistance.max
  ]);

  useEffect(() => {
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const departureCity = searchParams.get('departureCity');
    const pilgrimageType = searchParams.get('pilgrimageType');
    
    if (startDate && endDate && departureCity && pilgrimageType) {
      setPriceRangeManuallySet(false);
      loadTours();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchParams.get('startDate'),
    searchParams.get('endDate'),
    searchParams.get('departureCity'),
    searchParams.get('pilgrimageType'),
    sortBy
  ]);

  useEffect(() => {
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const departureCity = searchParams.get('departureCity');
    const pilgrimageType = searchParams.get('pilgrimageType');
    
    if (!(startDate && endDate && departureCity && pilgrimageType)) {
      return;
    }
    
    if (!priceRangeManuallySet) {
      return;
    }
    
    const timeoutId = setTimeout(() => {
      loadTours();
    }, 300);
    
    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceRange.min, priceRange.max, priceRangeManuallySet]);

  useEffect(() => {
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const departureCity = searchParams.get('departureCity');
    const pilgrimageType = searchParams.get('pilgrimageType');
    
    if (!(startDate && endDate && departureCity && pilgrimageType)) {
      return;
    }
    
    if (!filtersInitialized.current) {
      filtersInitialized.current = true;
      return;
    }
    
    const timeoutId = setTimeout(() => {
      loadTours();
    }, 300);
    
    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    flightTypes.direct, 
    flightTypes.transfer, 
    ticketTypes.economy, 
    ticketTypes.business, 
    ticketTypes.first, 
    foodTypes.BB, 
    foodTypes.HB, 
    foodTypes.FB, 
    foodTypes.AI, 
    JSON.stringify(transferTypes), 
    mekkaHotels.five, 
    mekkaHotels.four, 
    mekkaHotels.three, 
    medinaHotels.five, 
    medinaHotels.four, 
    medinaHotels.three, 
    mekkaDistance.min, 
    mekkaDistance.max, 
    medinaDistance.min, 
    medinaDistance.max
  ]);

  useEffect(() => {
    const loadTransfers = async () => {
      try {
        const transfers = await getTransfers();
        setAvailableTransfers(Array.isArray(transfers) ? transfers : []);
      } catch (error) {
        console.error('Ошибка загрузки трансферов:', error);
        setAvailableTransfers([]);
      }
    };
    loadTransfers();
  }, []);

  useEffect(() => {
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const departureCity = searchParams.get('departureCity');
    const pilgrimageType = searchParams.get('pilgrimageType');
    
    if (startDate && endDate && departureCity && pilgrimageType) {
      setShouldUpdatePriceBounds(true);
      setPriceRangeManuallySet(false);
    }
  }, [
    searchParams.get('startDate'),
    searchParams.get('endDate'),
    searchParams.get('departureCity'),
    searchParams.get('pilgrimageType')
  ]);

  useEffect(() => {
    if (allTours.length > 0 && shouldUpdatePriceBounds) {
      const prices = allTours.map(tour => parseFloat(tour.price) || 0);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      setMinTourPrice(minPrice);
      setMaxTourPrice(maxPrice);
      setShouldUpdatePriceBounds(false);
      
      if (!priceRangeManuallySet) {
        isAutoUpdatingPriceRange.current = true;
        setPriceRange({ min: minPrice, max: maxPrice });
        setTimeout(() => {
          isAutoUpdatingPriceRange.current = false;
        }, 0);
      }
    }
    
    if (allTours.length > 0) {
      const mekkaDistances = allTours
        .map(tour => {
          const distance = tour.hotel_mekka?.distance_number;
          if (!distance) return 0;
          return parseFloat(String(distance).replace(/[^\d.]/g, '')) || 0;
        })
        .filter(d => d > 0);
      const medinaDistances = allTours
        .map(tour => {
          const distance = tour.hotel_medina?.distance_number;
          if (!distance) return 0;
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
    }
  }, [allTours, shouldUpdatePriceBounds, priceRangeManuallySet]);

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
                setPriceRange={(updater) => {
                  setPriceRangeManuallySet(true);
                  if (typeof updater === 'function') {
                    setPriceRange(updater);
                  } else {
                    setPriceRange(updater);
                  }
                }}
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
                  {loading ? (
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
        setPriceRange={(updater) => {
          setPriceRangeManuallySet(true);
          if (typeof updater === 'function') {
            setPriceRange(updater);
          } else {
            setPriceRange(updater);
          }
        }}
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