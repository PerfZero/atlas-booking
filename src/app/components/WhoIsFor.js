import AboutService from './AboutService';

export default function WhoIsFor() {
  const whoIsForCards = [
    {
      icon: "/icon_5.svg",
      title: "Первое паломничество",
      description: "Мы всё возьмём на себя.\n \nПоможем выбрать тур, оформим документы, расскажем обо всём — шаг за шагом.",
      link: { href: "#", text: "Посмотреть туры" }
    },
    {
      icon: "/icon_6.svg", 
      title: "Высокий комфорт",
      description: "5★ отели, прямые рейсы, персональный подход и максимальный комфорт. \n \n Максимум удобства: от брони до возвращения домой.",
      link: { href: "#", text: "Найти турпакеты на Умру" }
    },
    {
      icon: "/icon_7.svg",
      title: "Всё под ключ", 
      description: "Никаких хлопот — только духовное спокойствие. \n \n Билеты, визы, отели и вся организация на нас.",
      link: { href: "#", text: "Перейти к бронированию" }
    },
    {
        icon: "/icon_8.svg",
      title: "Поддержка 24/7",
      description: "Всегда рядом — днём и ночью. \n \n Гиды, кураторы и WhatsApp-группа всегда на связи. Вы не останетесь без внимания!",
      link: { href: "#", text: "Связаться с нами" }
    }
  ];

  return (
    <AboutService 
      title="Кому подойдут наши туры"
      cards={whoIsForCards}
    />
  );
} 