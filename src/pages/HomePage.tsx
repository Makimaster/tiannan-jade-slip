import { createPortal } from 'react-dom';
import { useVideoBackground } from '../hooks/useVideoBackground';
import HeroSection from '../components/home/HeroSection';
import StatisticsPanel from '../components/home/StatisticsPanel';
import HonorsPanel from '../components/home/HonorsPanel';
import PromotionalSection from '../components/home/PromotionalSection';
import InkBrush from '../components/common/InkBrush';
import styles from './HomePage.module.css';

export default function HomePage() {
  useVideoBackground();

  const video = createPortal(
    <video
      className={styles.videoBg}
      src="/videos/bg-compressed.mp4"
      autoPlay
      loop
      muted
      playsInline
    />,
    document.body
  );

  return (
    <div className={styles.page}>
      {video}
      <div className={styles.content}>
        <HeroSection />
        <InkBrush />
        <HonorsPanel />
        <InkBrush />
        <StatisticsPanel />
        <InkBrush />
        <PromotionalSection />
      </div>
    </div>
  );
}
