import Header from './components/Header';
import Hero from './components/Hero';
import AboutService from './components/AboutService';
import WhoIsFor from './components/WhoIsFor';
import PopularTours from './components/PopularTours';
import TrustUs from './components/TrustUs';
import HowItWorks from './components/HowItWorks';
import Reviews from './components/Reviews';
import Partners from './components/Partners';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <Header />
      <Hero />
      <AboutService />
      <PopularTours />
      <TrustUs />
      <HowItWorks />
      <WhoIsFor />
      <Reviews />
      <Partners />
      <FAQ />
      <Footer />
    </div>
  );
}
