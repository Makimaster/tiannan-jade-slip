import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../i18n';
import { useVideoBackground } from '../hooks/useVideoBackground';
import ScrollPath from '../components/timeline/ScrollPath';
import styles from './TimelinePage.module.css';

export default function TimelinePage() {
  const [mode, setMode] = useState<'timeline' | 'image'>('timeline');
  const { t, lang } = useI18n();
  useVideoBackground();

  const video = createPortal(
    <video className={styles.videoBg} src="/videos/timeline-bg.mp4" autoPlay loop muted playsInline />,
    document.body
  );

  return (
    <div className={styles.page}>
      {video}
      <div className={styles.toggleBar}>
        <button
          className={`${styles.toggleBtn} ${mode === 'timeline' ? styles.toggleActive : ''}`}
          onClick={() => setMode('timeline')}
        >{t('timeline.toggleTimeline')}</button>
        <button
          className={`${styles.toggleBtn} ${mode === 'image' ? styles.toggleActive : ''}`}
          onClick={() => setMode('image')}
        >{t('timeline.toggleImage')}</button>
      </div>

      {mode === 'timeline' && <ScrollPath />}

      {mode === 'image' && (
        <div className={styles.imageView}>
          <img
            src={lang === 'en' ? '/images/bg/timeline-full-en.png' : '/images/bg/timeline-full.png'}
            alt={t('timeline.alt')}
            className={styles.fullImage}
          />
        </div>
      )}
    </div>
  );
}
