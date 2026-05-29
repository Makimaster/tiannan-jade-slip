import { useParams, Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { characters } from '../data/characters';
import styles from './CharacterDetailPage.module.css';

export default function CharacterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, lang } = useI18n();
  const ch = characters.find(c => c.id === id);

  if (!ch) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <p className={styles.notFound}>该人物未在典籍中记载。</p>
          <Link to="/characters" className={styles.backLink}>← 返回人物谱</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Link to="/characters" className={styles.backLink}>← 返回人物谱</Link>
        <div className={styles.hero}>
          <div className={styles.imageWrap}>
            {ch.imageUrl ? (
              <img src={ch.imageUrl} alt={lang === 'zh' ? ch.name : ch.nameEn} />
            ) : (
              <div className={styles.imagePlaceholder}>{ch.name[0]}</div>
            )}
          </div>
          <div className={styles.info}>
            <h1 className={styles.name}>{lang === 'zh' ? ch.name : ch.nameEn}</h1>
            {ch.aliases.length > 0 && (
              <p className={styles.aliases}>
                别称：{(lang === 'zh' ? ch.aliases : ch.aliasesEn).join('、')}
              </p>
            )}
            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>{t('characters.realm')}</span>
                <span>{lang === 'zh' ? ch.realm : ch.realmEn}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>{t('characters.affiliation')}</span>
                <span>{lang === 'zh' ? ch.affiliation : ch.affiliationEn}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>初登场</span>
                <span>{lang === 'zh' ? ch.firstAppearChapter : ch.firstAppearChapterEn}</span>
              </div>
            </div>
            <p className={styles.desc}>{lang === 'zh' ? ch.description : ch.descriptionEn}</p>
            <p className={styles.personality}>性格：{lang === 'zh' ? ch.personality : ch.personalityEn}</p>
            {ch.techniques.length > 0 && (
              <div className={styles.techniques}>
                <span className={styles.metaLabel}>{t('characters.techniques')}</span>
                <div className={styles.tagList}>
                  {(lang === 'zh' ? ch.techniques : (ch.techniquesEn ?? ch.techniques)).map((tech, i) => (
                    <span key={i} className={styles.tag}>{tech}</span>
                  ))}
                </div>
              </div>
            )}
            {ch.relations.length > 0 && (
              <div className={styles.relations}>
                <span className={styles.metaLabel}>{t('characters.relations')}</span>
                <div className={styles.relationList}>
                  {ch.relations.map((rel, i) => (
                    <Link to={`/characters/${rel.targetId}`} key={i} className={styles.relationTag}>
                      {lang === 'zh' ? rel.targetName : (rel.targetNameEn ?? rel.targetName)} · {lang === 'zh' ? rel.relation : rel.relationEn}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <p className={styles.ending}>结局：{lang === 'zh' ? ch.ending : ch.endingEn}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
