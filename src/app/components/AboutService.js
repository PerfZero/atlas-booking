import Image from 'next/image';
import styles from './AboutService.module.css';

export default function AboutService({ title, cards }) {
  const defaultCards = [
    {
      icon: "/icon_1.svg",
      title: "Мы — гарантия надёжности",
      description: "Все туры размещены только от Atlas Tourism — компании с 16-летним опытом и безупречной репутацией. Мы отвечаем за каждый тур лично.",
      link: { href: "#", text: "Посмотреть туры" }
    },
    {
      icon: "/icon_2.svg", 
      title: "Только проверенные пакеты",
      description: "Каждое предложение проходит ручную проверку. Вы точно получите то, за что заплатили — от отеля до трансфера. Никаких «неприятных сюрпризов».",
      link: { href: "#", text: "Найти турпакеты на Умру" }
    },
    {
      icon: "/icon_3.svg",
      title: "Безопасная оплата и защита данных", 
      description: "Оплачивайте удобно: Kaspi, Visa, Mastercard. Все данные надёжно защищены — используем банковские протоколы безопасности.",
      link: { href: "#", text: "Перейти к бронированию" }
    },
    {
      icon: "/icon_4.svg",
      title: "Всегда рядом, чтобы помочь",
      description: "Менеджер сразу свяжется с вами, добавит в WhatsApp-группу и будет на связи до конца паломничества. Отвечаем, подсказываем, сопровождаем.",
      link: { href: "#", text: "Связаться с нами" }
    }
  ];

  const displayTitle = title || "О сервисе Atlas Booking";
  const displayCards = cards || defaultCards;

  return (
    <section className={styles.aboutService}>
      <div className={styles.container}>
        <h2 className={styles.title}>{displayTitle}</h2>
        <div className={styles.cards}>
          {displayCards.map((card, idx) => (
            <div className={styles.card} key={idx}>
              <div className={styles.icon}>
                <Image src={card.icon} alt={card.title} width={40} height={40} />
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