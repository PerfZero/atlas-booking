import Image from 'next/image';
import styles from './PopularTours.module.css';

export default function PopularTours() {
  return (
    <section className={styles.popularTours}>
      <div className={styles.container}>
        <h2 className={styles.title}>Популярные туры</h2>
        
        <div className={styles.cards}>
          <div className={styles.card}>
            <div className={styles.imageContainer}>
              <Image src="/tour_1.png" alt="Fairmont Package" width={320} height={400} className={styles.image} />
              <div className={styles.price}>От 2 500 $</div>
              <div className={styles.overlay}>
                <div className={styles.tags}>
                  <span className={styles.tag}>Умра</span>
                  <span className={styles.tag}>Лучший отель</span>
                </div>
                <h3 className={styles.packageName}>Fairmont Package</h3>
                <button className={styles.arrowBtn}>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M10.7478 8.26334L10.7411 1.52675C10.7411 1.14505 10.4933 0.877197 10.0916 0.877197H3.35494C2.97994 0.877197 2.72548 1.16514 2.72548 1.48657C2.72548 1.808 3.01343 2.08255 3.32816 2.08255H5.65852L8.92638 1.97541L7.68083 3.06693L1.04468 9.71648C0.924142 9.83699 0.857178 9.99105 0.857178 10.1384C0.857178 10.4598 1.14512 10.7611 1.47994 10.7611C1.63397 10.7611 1.78129 10.7076 1.90182 10.5803L8.55135 3.93746L9.65626 2.68523L9.53575 5.81247V8.29014C9.53575 8.60488 9.81032 8.89951 10.1384 8.89951C10.4599 8.89951 10.7478 8.62499 10.7478 8.26334Z" fill="#253168" />
</svg>
                </button>
              </div>
            </div>
          </div>
          
          <div className={styles.card}>
            <div className={styles.imageContainer}>
              <Image src="/tour_2.png" alt="Address Package" width={320} height={400} className={styles.image} />
              <div className={styles.price}>От 1 900 $</div>
              <div className={styles.overlay}>
                <div className={styles.tags}>
                  <span className={styles.tag}>Умра</span>
                  <span className={styles.tag}>Лучший отель</span>
                </div>
                <h3 className={styles.packageName}>Address Package</h3>
                <button className={styles.arrowBtn}>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M10.7478 8.26334L10.7411 1.52675C10.7411 1.14505 10.4933 0.877197 10.0916 0.877197H3.35494C2.97994 0.877197 2.72548 1.16514 2.72548 1.48657C2.72548 1.808 3.01343 2.08255 3.32816 2.08255H5.65852L8.92638 1.97541L7.68083 3.06693L1.04468 9.71648C0.924142 9.83699 0.857178 9.99105 0.857178 10.1384C0.857178 10.4598 1.14512 10.7611 1.47994 10.7611C1.63397 10.7611 1.78129 10.7076 1.90182 10.5803L8.55135 3.93746L9.65626 2.68523L9.53575 5.81247V8.29014C9.53575 8.60488 9.81032 8.89951 10.1384 8.89951C10.4599 8.89951 10.7478 8.62499 10.7478 8.26334Z" fill="#253168" />
</svg>
                </button>
              </div>
            </div>
          </div>
          
          <div className={styles.card}>
            <div className={styles.imageContainer}>
              <Image src="/tour_3.png" alt="Swissotel Package" width={320} height={400} className={styles.image} />
              <div className={styles.price}>От 2 300 $</div>
              <div className={styles.overlay}>
                <div className={styles.tags}>
                  <span className={styles.tag}>Умра</span>
                  <span className={styles.tag}>Лучший отель</span>
                </div>
                <h3 className={styles.packageName}>Swissotel Package</h3>
                <button className={styles.arrowBtn}>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M10.7478 8.26334L10.7411 1.52675C10.7411 1.14505 10.4933 0.877197 10.0916 0.877197H3.35494C2.97994 0.877197 2.72548 1.16514 2.72548 1.48657C2.72548 1.808 3.01343 2.08255 3.32816 2.08255H5.65852L8.92638 1.97541L7.68083 3.06693L1.04468 9.71648C0.924142 9.83699 0.857178 9.99105 0.857178 10.1384C0.857178 10.4598 1.14512 10.7611 1.47994 10.7611C1.63397 10.7611 1.78129 10.7076 1.90182 10.5803L8.55135 3.93746L9.65626 2.68523L9.53575 5.81247V8.29014C9.53575 8.60488 9.81032 8.89951 10.1384 8.89951C10.4599 8.89951 10.7478 8.62499 10.7478 8.26334Z" fill="#253168" />
</svg>
                </button>
              </div>
            </div>
          </div>
          
          <div className={styles.card}>
            <div className={styles.imageContainer}>
              <Image src="/tour_4.png" alt="Madinah Package" width={320} height={400} className={styles.image} />
              <div className={styles.price}>От 1 500 $</div>
              <div className={styles.overlay}>
                <div className={styles.tags}>
                  <span className={styles.tag}>Умра</span>
                  <span className={styles.tag}>Лучший отель</span>
                </div>
                <h3 className={styles.packageName}>Madinah Package</h3>
                <button className={styles.arrowBtn}>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M10.7478 8.26334L10.7411 1.52675C10.7411 1.14505 10.4933 0.877197 10.0916 0.877197H3.35494C2.97994 0.877197 2.72548 1.16514 2.72548 1.48657C2.72548 1.808 3.01343 2.08255 3.32816 2.08255H5.65852L8.92638 1.97541L7.68083 3.06693L1.04468 9.71648C0.924142 9.83699 0.857178 9.99105 0.857178 10.1384C0.857178 10.4598 1.14512 10.7611 1.47994 10.7611C1.63397 10.7611 1.78129 10.7076 1.90182 10.5803L8.55135 3.93746L9.65626 2.68523L9.53575 5.81247V8.29014C9.53575 8.60488 9.81032 8.89951 10.1384 8.89951C10.4599 8.89951 10.7478 8.62499 10.7478 8.26334Z" fill="#253168" />
</svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 