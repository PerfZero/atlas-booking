'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchForm from '../components/SearchForm';
import Breadcrumbs from '../components/Breadcrumbs';
import styles from './page.module.css';
import TourCard from '../components/TourCard';
import SearchFilters from '../components/SearchFilters';

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