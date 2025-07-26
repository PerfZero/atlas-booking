import React from 'react';
import styles from './HowItWorks.module.css';

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      title: 'Поиск и выбор тура',
      description: 'Вы задаёте параметры (даты, город вылета, бюджет) и находите подходящий тур в пару кликов.',
      icon: '/step_1.svg',
      iconClass: 'search'
    },
    {
      id: 2,
      title: 'Бронирование и оплата',
      description: 'Бронируете удобный пакет и оплачиваете безопасно — через Kaspi или любой картой и получаете ваучер на поездку.',
      icon: '/step_2.svg',
      iconClass: 'booking'
    },
    {
      id: 3,
      title: 'Связь с менеджером',
      description: 'Наш менеджер связывается с вами, добавляет в WhatsApp-группу и держит в курсе всех новостей и этапов.',
      icon: '/step_3.svg',
      iconClass: 'contact'
    },
    {
      id: 4,
      title: 'Обучение и Хадж-набор',
      description: 'За неделю до вылета мы проводим обучающий семинар и выдаём полный Хадж-набор паломника.',
      icon: '/step_4.svg',
      iconClass: 'training'
    },
    {
      id: 5,
      title: 'Вылет и сопровождение',
      description: 'В день вылета вас встречает наш гид и сопровождает в аэропорту — помощь с регистрацией и документами.',
      icon: '/step_5.svg',
      iconClass: 'flight'
    },
    {
      id: 6,
      title: 'Забота о Вас',
      description: 'На всём пути паломничества — от начала до возвращения домой — вы под заботой наших опытных гидов и кураторов.',
      icon: '/step_6.svg',
      iconClass: 'care'
    }
  ];

  return (
    <section className={styles.howItWorks}>
      <div className={styles.container}>
        <h1 className={styles.title}>Как проходит поездка?</h1>
        
        <div className={styles.timeline}>
          {steps.map((step, index) => (
            <div key={step.id} className={`${styles.timelineItem} ${index % 2 === 0 ? styles.left : styles.right}`}>
              <div className={`${styles.timelineIcon} ${styles[step.iconClass]}`}>
                <img src={step.icon} alt={step.title} className={styles.iconImage} />
              </div>
              <div className={styles.timelineContent}>
                <h3 className={styles.timelineTitle}>{step.title}</h3>
                <p className={styles.timelineDescription}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
