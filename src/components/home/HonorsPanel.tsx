import { useI18n } from '../../i18n';
import { honors } from '../../data/honors';
import styles from './HonorsPanel.module.css';

export default function HonorsPanel() {
  const { t, lang } = useI18n();

  return (
    <section className={styles.panel}>
      <div className={styles.inner}>
        <h2 className={styles.title}>{t('honors.title')}</h2>
        <p className={styles.subtitle}>{t('honors.subtitle')}</p>
        <div className={styles.list}>
          {honors.map((h) => (
            <div key={h.id} className={styles.item}>
              <span className={styles.year}>{h.year}</span>
              <div className={styles.itemContent}>
                <span className={styles.honorTitle}>
                  {lang === 'zh' ? h.title : h.titleEn}
                </span>
                <span className={styles.honorIssuer}>
                  {lang === 'zh' ? h.issuer : h.issuerEn}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
