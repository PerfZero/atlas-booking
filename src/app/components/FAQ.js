'use client';
import { useState } from 'react';
import styles from './FAQ.module.css';

export default function FAQ() {
  const [openItem, setOpenItem] = useState(0);

  const faqItems = [
    {
      id: 0,
      question: "Что входит в турпакет?",
      answer: "В стоимость обычно входят: авиабилеты, отели в Мекке и Медине, трансферы, виза, сопровождение гида, семинар и хадж-набор."
    },
    {
      id: 1,
      question: "Как забронировать тур?",
      answer: "Вы можете забронировать тур через наш сайт, позвонив по телефону или обратившись к нашему менеджеру. Мы поможем подобрать подходящий вариант."
    },
    {
      id: 2,
      question: "Как можно оплатить?",
      answer: "Мы принимаем оплату наличными, банковскими картами, банковским переводом и через электронные платежные системы."
    },
    {
      id: 3,
      question: "Можно ли оформить рассрочку?",
      answer: "Да, мы предоставляем возможность оформления рассрочки на выгодных условиях. Подробности уточняйте у наших менеджеров."
    },
    {
      id: 4,
      question: "Как оформляется виза?",
      answer: "Мы полностью берем на себя оформление визы. Вам нужно только предоставить необходимые документы, остальное сделаем мы."
    },
    {
      id: 5,
      question: "Безопасно ли бронировать через ваш сайт?",
      answer: "Да, наш сайт полностью безопасен. Мы используем современные технологии защиты данных и работаем только с проверенными партнерами."
    },
    {
      id: 6,
      question: "Кто будет сопровождать нас во время поездки?",
      answer: "Вас будет сопровождать опытный гид-переводчик, который знает все особенности паломничества и поможет в любой ситуации."
    },
    {
      id: 7,
      question: "Можно ли ехать одному/одной?",
      answer: "Конечно! Многие паломники путешествуют самостоятельно. Мы обеспечим полную поддержку и сопровождение."
    },
    {
      id: 8,
      question: "Когда и как я получу хадж-набор?",
      answer: "Хадж-набор вы получите перед вылетом или по прибытии в Саудовскую Аравию. В него входят все необходимые вещи для паломничества."
    },
    {
      id: 9,
      question: "Что делать, если я не нашёл подходящий тур?",
      answer: "Свяжитесь с нами, и мы подберем индивидуальный тур под ваши потребности и бюджет. У нас есть множество вариантов."
    }
  ];

  const toggleItem = (id) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <section className={styles.faq}>
      <div className={styles.container}>
        <h2 className={styles.title}>Часто задаваемые вопросы</h2>
        <div className={styles.faqList}>
          {faqItems.map((item) => (
            <div key={item.id} className={styles.faqItem}>
              <div 
                className={styles.faqHeader}
                onClick={() => toggleItem(item.id)}
              >
                <h3 className={styles.question}>{item.question}</h3>
                <div className={`${styles.icon} ${openItem === item.id ? styles.iconOpen : ''}`}>
                  {openItem === item.id ? '×' : '+'}
                </div>
              </div>
              <div className={`${styles.answer} ${openItem === item.id ? styles.answerOpen : ''}`}>
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 