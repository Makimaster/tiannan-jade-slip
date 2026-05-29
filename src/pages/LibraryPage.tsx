import { useState, useCallback } from 'react';
import { useI18n } from '../i18n';
import type { SearchResponse } from '../types';
import SectionTitle from '../components/common/SectionTitle';
import styles from './LibraryPage.module.css';

export default function LibraryPage() {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<SearchResponse | null>(null);

  const hotQuestions = Array.from({ length: 8 }, (_, i) => t(`library.hotQ.${i}`));

  const search = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&top=10`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: SearchResponse = await res.json();
      setResult(data);
    } catch (e) {
      setError(t('library.error'));
      console.error('Search error:', e);
    } finally {
      setLoading(false);
    }
  }, [t]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    search(query);
  };

  const handleHotClick = (q: string) => {
    setQuery(q);
    search(q);
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <SectionTitle title={t('library.title')} subtitle={t('library.subtitle')} />

        {/* Search Bar */}
        <form className={styles.searchForm} onSubmit={handleSubmit}>
          <div className={styles.searchBar}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder={t('library.placeholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className={styles.searchBtn} disabled={loading || !query.trim()}>
              {loading ? t('library.searching') : t('library.search')}
            </button>
          </div>
        </form>

        {/* Hot Questions */}
        {!result && !loading && !error && (
          <div className={styles.hotSection}>
            <h3 className={styles.hotTitle}>{t('library.hotQuestions')}</h3>
            <div className={styles.hotGrid}>
              {hotQuestions.map((q, i) => (
                <button key={i} className={styles.hotTag} onClick={() => handleHotClick(q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className={styles.statusBox}>
            <div className={styles.spinner} />
            <p className={styles.statusText}>{t('library.searching')}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className={styles.statusBox}>
            <p className={styles.statusText} style={{ color: 'var(--vermillion)' }}>{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className={styles.results}>
            <p className={styles.resultMeta}>
              "{result.query}" — {t('library.results')} <strong>{result.total_matches}</strong> 条
              <span className={styles.time}>（{result.time_ms}ms）</span>
            </p>

            {result.results.length === 0 ? (
              <div className={styles.statusBox}>
                <p className={styles.statusText}>{t('library.noResults')}</p>
              </div>
            ) : (
              <div className={styles.resultList}>
                {result.results.map((item, i) => (
                  <div key={i} className={styles.passageCard}>
                    <div className={styles.passageHeader}>
                      <span className={styles.passageIndex}>#{i + 1}</span>
                      <span className={styles.passageChapter}>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginRight: 4 }}>
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        </svg>
                        {item.chapter}
                      </span>
                      <span className={styles.passageScore}>
                        {t('library.score')}: {item.score.toFixed(1)}
                      </span>
                    </div>
                    <p className={styles.passageText}>{item.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
