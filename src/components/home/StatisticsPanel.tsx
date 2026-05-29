import { useI18n } from '../../i18n';
import { siteStatistics } from '../../data/statistics';
import styles from './StatisticsPanel.module.css';

function formatValue(raw: number): { value: string; suffix: string } {
  if (raw >= 1_0000_0000) {
    return { value: (raw / 1_0000_0000).toFixed(1), suffix: '亿' };
  }
  if (raw >= 1_0000) {
    return { value: (raw / 1_0000).toFixed(0), suffix: '万' };
  }
  return { value: String(raw), suffix: '' };
}

export default function StatisticsPanel() {
  const { t } = useI18n();

  const views = formatValue(siteStatistics.bilibiliSeriesViews);
  const favorites = formatValue(siteStatistics.bilibiliFavorites);

  const items = [
    { key: 'views', label: t('stats.views'), value: views.value, suffix: views.suffix },
    { key: 'favorites', label: t('stats.favorites'), value: favorites.value, suffix: favorites.suffix },
    { key: 'biliRating', label: t('stats.biliRating'), value: String(siteStatistics.bilibiliRating), suffix: '' },
    { key: 'doubanRating', label: t('stats.doubanRating'), value: String(siteStatistics.doubanRating), suffix: '' },
    { key: 'episodes', label: t('stats.episodes'), value: String(siteStatistics.totalEpisodes), suffix: t('stats.episodeSuffix') },
  ];

  return (
    <section className={styles.panel}>
      <div className={styles.inner}>
        <h2 className={styles.title}>{t('stats.title')}</h2>
        <p className={styles.subtitle}>{t('stats.subtitle')}</p>
        <div className={styles.grid}>
          {items.map((item) => (
            <div key={item.key} className={styles.item}>
              <span className={styles.value}>
                {item.value}{item.suffix}
              </span>
              <span className={styles.itemLabel}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
