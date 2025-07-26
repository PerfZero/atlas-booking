import Image from 'next/image';
import styles from './AboutService.module.css';

export default function AboutService({ title, cards }) {
  const defaultCards = [
    {
      icon: "/icon_1.svg",
      title: "Первое паломничество",
      description: "Мы всё возьмём на себя. Поможем выбрать тур, оформим документы, расскажем обо всём — шаг за шагом.",
      link: { href: "#", text: "Посмотреть туры" }
    },
    {
      icon: "/icon_2.svg", 
      title: "Высокий комфорт",
      description: "5★ отели, прямые рейсы, персональный подход и максимальный комфорт. Максимум удобства: от брони до возвращения домой.",
      link: { href: "#", text: "Найти турпакеты на Умру" }
    },
    {
      icon: "/icon_3.svg",
      title: "Всё под ключ", 
      description: "Никаких хлопот — только духовное спокойствие. Билеты, визы, отели и вся организация на нас.",
      link: { href: "#", text: "Перейти к бронированию" }
    },
    {
      icon: "/icon_4.svg",
      title: "Поддержка 24/7",
      description: "Всегда рядом — днём и ночью. Гиды, кураторы и WhatsApp-группа всегда на связи. Вы не останетесь без внимания!",
      link: { href: "#", text: "Связаться с нами" }
    }
  ];

  const displayTitle = title || "Кому подойдут наши туры";
  const displayCards = cards || defaultCards;

  return (
    <section className={styles.aboutService}>
      <div className={styles.container}>
        <h2 className={styles.title}>{displayTitle}</h2>
        <div className={styles.cards}>
          {displayCards.map((card, idx) => (
            <div className={styles.card} key={idx}>
              <div className={styles.icon}>
                <Image src={card.icon} alt={card.title} width={48} height={48} />
              </div>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardDescription}>{card.description}</p>
              {card.link && (
                <a href={card.link.href} className={styles.cardLink}>{card.link.text}</a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 