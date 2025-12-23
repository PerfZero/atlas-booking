'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './Partners.module.css';

function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('/')) return true;
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return null;
  if (url.startsWith('/')) return url;
  if (isValidImageUrl(url)) return url;
  return null;
}

export default function Partners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await fetch('https://booking.atlas.kz/wp-json/atlas-hajj/v1/home-partners');
        if (!response.ok) throw new Error('Ошибка загрузки партнеров');
        const data = await response.json();
        setPartners(data);
      } catch (error) {
        console.error('Ошибка получения партнеров:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  if (loading) {
    return (
      <section className={styles.partners}>
        <div className={styles.container}>
          <h2 className={styles.title}>Наши партнеры</h2>
          <div className={styles.logoGrid}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className={styles.logoCard}>
                <div className={styles.logoPlaceholder}>Загрузка...</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!partners || partners.length === 0) {
    return null;
  }

  return (
    <section className={styles.partners}>
      <div className={styles.container}>
        <h2 className={styles.title}>Наши партнеры</h2>
        <div className={styles.logoGrid}>
          {partners.map((partner) => {
            const logoUrl = normalizeImageUrl(partner.logo);
            if (!logoUrl) return null;
            return (
              <div key={partner.id} className={styles.logoCard}>
                <Image 
                  src={logoUrl} 
                  alt={partner.name}
                  width={200}
                  height={100}
                  className={styles.logo}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
} 