import { useI18n } from '../../i18n';
import styles from './Footer.module.css';

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.divider} />
        <p className={styles.text}>{t('footer.text')}</p>
      </div>
    </footer>
  );
}
