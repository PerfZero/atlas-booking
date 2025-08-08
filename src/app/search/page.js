'use client';
import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchToursWithFilters } from '../../lib/wordpress-api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchForm from '../components/SearchForm';
import Breadcrumbs from '../components/Breadcrumbs';
import styles from './page.module.css';
import TourCard from '../components/TourCard';
import SearchFilters from '../components/SearchFilters';
import MobileFilters from '../components/MobileFilters';
import CustomSortSelect from '../components/CustomSortSelect';
import BottomNavigation from '../components/BottomNavigation';

function SearchPageWithParams() {
  const searchParams = useSearchParams();
  
  return <SearchPageContent searchParams={searchParams} />;
}

function SearchPageContent({ searchParams }) {
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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
      
      const filters = {
        departureCity,
        pilgrimageType,
        startDate,
        endDate,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        sortBy
      };
      
      const result = await searchToursWithFilters(filters);
      
      if (result.success && result.tours) {
        setFilteredResults(result.tours);
      } else {
        setFilteredResults([]);
      }
    } catch (error) {
      console.error('Ошибка загрузки туров:', error);
      setFilteredResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams, priceRange, sortBy]);

  useEffect(() => {
    loadTours();
  }, [searchParams, sortBy, priceRange, flightTypes, ticketTypes, mekkaHotels, medinaHotels, mekkaDistance, medinaDistance, foodTypes, transferTypes, loadTours]);

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
                <SearchForm className={styles.searchForm} />
              </Suspense>
            </div>
          </div>
          <Breadcrumbs items={breadcrumbItems} />

          <div className={styles.content}>
            
            <div className={styles.leftColumn}>
              <SearchFilters 
                priceRange={priceRange}
                setPriceRange={setPriceRange}
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
                medinaDistance={medinaDistance}
                setMedinaDistance={setMedinaDistance}
                foodTypes={foodTypes}
                setFoodTypes={setFoodTypes}
                transferTypes={transferTypes}
                setTransferTypes={setTransferTypes}
              />
            </div>

            <div className={styles.rightColumn}>
              <section className={styles.results}>
                <div className={styles.resultsHeader}>
                  <div className={styles.resultsHeaderTop}>
                    <h3 className={styles.resultsTitle}>Результаты поиска. Найдено {filteredResults.length} варианта</h3>
                    <button 
                      className={styles.mobileFiltersButton}
                      onClick={() => setMobileFiltersOpen(true)}
                    >
                      <img src="/sort.svg" alt="Фильтры" />
                      Фильтры
                    </button>
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
                    <div className={styles.loading}>
                      <h3>Загрузка туров...</h3>
                    </div>
                  ) : filteredResults.length > 0 ? (
                    filteredResults.map((tour) => (
                      <TourCard key={tour.id} tour={tour} />
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
        medinaDistance={medinaDistance}
        setMedinaDistance={setMedinaDistance}
        foodTypes={foodTypes}
        setFoodTypes={setFoodTypes}
        transferTypes={transferTypes}
        setTransferTypes={setTransferTypes}
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        onApply={() => {
          setMobileFiltersOpen(false);
          loadTours();
        }}
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