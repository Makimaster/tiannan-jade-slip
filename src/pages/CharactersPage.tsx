import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useVideoBackground } from '../hooks/useVideoBackground';
import { characters } from '../data/characters';
import SectionTitle from '../components/common/SectionTitle';
import styles from './CharactersPage.module.css';

export default function CharactersPage() {
  const { t, lang } = useI18n();
  useVideoBackground();

  const video = createPortal(
    <video className={styles.videoBg} src="/videos/characters-bg.mp4" autoPlay loop muted playsInline />,
    document.body
  );

  return (
    <div className={styles.page}>
      {video}
      <div className={styles.inner}>
        <SectionTitle title={t('characters.title')} subtitle={t('characters.subtitle')} />
        <div className={styles.grid}>
          {characters.map((ch) => (
            <Link to={`/characters/${ch.id}`} key={ch.id} className={styles.card}>
              <div className={styles.cardImage}>
                {ch.imageUrl ? (
                  <img src={ch.imageUrl} alt={lang === 'zh' ? ch.name : ch.nameEn} loading="lazy" />
                ) : (
                  <div className={styles.imagePlaceholder}>{ch.name[0]}</div>
                )}
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardName}>{lang === 'zh' ? ch.name : ch.nameEn}</h3>
                <p className={styles.cardRealm}>
                  <span className={styles.label}>{t('characters.realm')}:</span> {lang === 'zh' ? ch.realm : ch.realmEn}
                </p>
                <p className={styles.cardAffiliation}>
                  <span className={styles.label}>{t('characters.affiliation')}:</span> {lang === 'zh' ? ch.affiliation : ch.affiliationEn}
                </p>
                {ch.status !== 'alive' && (
                  <span className={`${styles.statusBadge} ${styles[ch.status]}`}>
                    {t(`characters.status.${ch.status}`)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
