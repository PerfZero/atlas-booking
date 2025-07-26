import Image from 'next/image';
import styles from './Partners.module.css';

export default function Partners() {
  const partners = [
    { id: 1, logo: "/part_1.svg", name: "Air Astana" },
    { id: 2, logo: "/part_2.svg", name: "Turkish Airlines" },
    { id: 3, logo: "/part_3.svg", name: "Air Arabia" },
    { id: 4, logo: "/part_4.svg", name: "ADDRESS JABAL OMAR MAKKAH" },
    { id: 5, logo: "/part_1.svg", name: "Partner 5" },
    { id: 6, logo: "/part_2.svg", name: "Partner 6" },
    { id: 7, logo: "/part_3.svg", name: "Partner 7" },
    { id: 8, logo: "/part_4.svg", name: "Partner 8" },
    { id: 9, logo: "/part_1.svg", name: "Partner 9" },
    { id: 10, logo: "/part_2.svg", name: "Partner 10" },
    { id: 11, logo: "/part_3.svg", name: "Partner 11" },
    { id: 12, logo: "/part_4.svg", name: "Partner 12" }
  ];

  return (
    <section className={styles.partners}>
      <div className={styles.container}>
        <h2 className={styles.title}>Наши партнеры</h2>
        <div className={styles.logoGrid}>
          {partners.map((partner) => (
            <div key={partner.id} className={styles.logoCard}>
              <Image 
                src={partner.logo} 
                alt={partner.name}
                width={200}
                height={100}
                className={styles.logo}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 