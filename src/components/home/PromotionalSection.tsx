import { useI18n } from '../../i18n';
import styles from './PromotionalSection.module.css';

export default function PromotionalSection() {
  const { t } = useI18n();

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.synopsis}>
          <h2 className={styles.title}>{t('promo.synopsis')}</h2>
          <p className={styles.p}>{t('promo.synopsisP1')}</p>
          <p className={styles.p}>{t('promo.synopsisP2')}</p>
          <p className={styles.p}>{t('promo.synopsisP3')}</p>
        </div>
        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureNum}>01</span>
            <h3 className={styles.featureTitle}>{t('promo.h1.title')}</h3>
            <p className={styles.featureDesc}>{t('promo.h1.desc')}</p>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureNum}>02</span>
            <h3 className={styles.featureTitle}>{t('promo.h2.title')}</h3>
            <p className={styles.featureDesc}>{t('promo.h2.desc')}</p>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureNum}>03</span>
            <h3 className={styles.featureTitle}>{t('promo.h3.title')}</h3>
            <p className={styles.featureDesc}>{t('promo.h3.desc')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
