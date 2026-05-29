import { useI18n } from '../i18n';
import { artifacts } from '../data/artifacts';
import SectionTitle from '../components/common/SectionTitle';
import styles from './ArtifactsPage.module.css';

export default function ArtifactsPage() {
  const { t, lang } = useI18n();

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <SectionTitle title={t('artifacts.title')} subtitle={t('artifacts.subtitle')} />
        <div className={styles.grid}>
          {artifacts.map((item) => (
            <div key={item.id} className={styles.card}>
              <div className={styles.cardImage}>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={lang === 'zh' ? item.name : item.nameEn} loading="lazy" />
                ) : (
                  <div className={styles.imagePlaceholder}>{item.name[0]}</div>
                )}
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardName}>{lang === 'zh' ? item.name : item.nameEn}</h3>
                <p className={styles.cardType}>
                  <span className={styles.label}>{t('artifacts.type')}:</span> {lang === 'zh' ? item.type : (item.typeEn ?? item.type)}
                </p>
                <p className={styles.cardOwner}>
                  <span className={styles.label}>{t('artifacts.owner')}:</span>{' '}
                  {lang === 'zh'
                    ? item.ownerName
                    : (item.ownerNameEn ?? item.ownerName)}
                </p>
                <p className={styles.cardDesc}>{lang === 'zh' ? item.description : item.descriptionEn}</p>
                <div className={styles.abilities}>
                  <span className={styles.label}>{t('artifacts.abilities')}:</span>
                  <div className={styles.tagList}>
                    {(lang === 'zh' ? item.abilities : item.abilitiesEn).map((a, i) => (
                      <span key={i} className={styles.tag}>{a}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
