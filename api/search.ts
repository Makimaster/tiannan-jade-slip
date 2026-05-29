/**
 * Cang Jing Ge Search API - Vercel Serverless Function (V5)
 * Hybrid search: BM25 + semantic query expansion + phrase boosting
 * - jieba word segmentation for query understanding
 * - Cultivation synonym dictionary for query expansion
 * - BM25 two-phase retrieval (char pre-filter + bigram scoring)
 * - Phrase-level relevance boosting
 * Zero external dependencies, zero cost.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createReadStream } from 'fs';
import { createGunzip } from 'zlib';
import { resolve } from 'path';

// ─── Types ───
interface Chunk {
  id: number;
  chapter: string;
  text: string;
  tc: number;
  cs: string;
}

interface KnowledgeBase {
  chunks: Chunk[];
  total_docs: number;
  avg_tc: number;
}

interface SearchResult {
  id: number;
  chapter: string;
  text: string;
  score: number;
}

// ─── BM25 params ───
const K1 = 1.5;
const B = 0.75;

// Module-level cache for Vercel instance reuse
let kbCache: KnowledgeBase | null = null;

// ─── Cultivation Synonym Dictionary ───
// Each key expands to itself + related terms to catch semantically similar text
const SYNONYM_MAP: Record<string, string[]> = {
  // 境界
  '练气': ['练气', '练气期', '炼气', '炼气期', '气感'],
  '筑基': ['筑基', '筑基期', '筑基丹', '筑基修士'],
  '结丹': ['结丹', '结丹期', '金丹', '金丹期', '结丹修士', '金丹修士'],
  '元婴': ['元婴', '元婴期', '元婴修士', '元婴老怪'],
  '化神': ['化神', '化神期', '化神修士'],
  '炼虚': ['炼虚', '炼虚期'],
  '合体': ['合体', '合体期', '合体修士'],
  '大乘': ['大乘', '大乘期', '大乘修士', '渡劫'],
  // 人物
  '韩立': ['韩立', '韩老魔', '韩跑跑', '厉飞雨'],
  '南宫婉': ['南宫婉', '南宫', '南宫仙子'],
  '墨大夫': ['墨大夫', '墨居仁', '墨师'],
  // 功法
  '长春功': ['长春功', '长春功法'],
  '青元剑诀': ['青元剑诀', '青元剑气', '剑诀'],
  '大衍诀': ['大衍诀', '大衍', '大衍神念'],
  // 法宝
  '掌天瓶': ['掌天瓶', '掌天', '天瓶', '翠绿小瓶', '小瓶'],
  '虚天鼎': ['虚天鼎', '虚天', '乾蓝冰焰', '虚天殿'],
  '青竹蜂云剑': ['青竹蜂云剑', '青竹剑', '蜂云剑', '本命法宝'],
  '噬金虫': ['噬金虫', '噬金', '金虫', '灵虫'],
  '辟邪神雷': ['辟邪神雷', '辟邪', '神雷'],
  // 法术
  '搜魂': ['搜魂', '搜魂术', '搜魂大法'],
  '夺舍': ['夺舍', '夺舍大法', '附身', '占据肉身'],
  '双修': ['双修', '双修之术', '合欢'],
  // 丹药
  '丹药': ['丹药', '灵丹', '仙丹', '灵药', '丹药之道'],
  '筑基丹': ['筑基丹', '筑基金丹', '筑基灵丹'],
  // 宗门
  '七玄门': ['七玄门', '七玄'],
  '黄枫谷': ['黄枫谷', '黄枫'],
  // 地点
  '乱星海': ['乱星海', '星海', '外星海', '内星海'],
  '天南': ['天南', '天南修仙界', '天南大陆'],
  '大晋': ['大晋', '大晋国', '大晋皇朝'],
  // 概念
  '法宝': ['法宝', '法器', '灵器', '灵宝', '古宝', '宝'),
  '灵石': ['灵石', '灵石矿', '仙玉', '元石'],
  '飞升': ['飞升', '飞升灵界', '破碎虚空', '升仙'],
  '修仙': ['修仙', '修真', '修道', '修炼', '修行'],
  '神识': ['神识', '神念', '神魂', '精神力'],
  '灵根': ['灵根', '灵根资质', '仙根'],
};

// ─── Expand query with semantic synonyms ───
function expandQuery(query: string): string[] {
  const expandedTerms: string[] = [query]; // original query always included

  for (const [key, synonyms] of Object.entries(SYNONYM_MAP)) {
    if (query.includes(key)) {
      for (const syn of synonyms) {
        if (!expandedTerms.includes(syn)) {
          expandedTerms.push(syn);
        }
      }
    }
  }

  return expandedTerms;
}

// ─── Tokenize: char bigrams + unigrams ───
function tokenize(text: string): string[] {
  const terms: string[] = [];
  const chars: string[] = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch >= '一' && ch <= '鿿') {
      chars.push(ch);
    }
  }
  // Bigrams
  for (let i = 0; i < chars.length - 1; i++) {
    terms.push(chars[i] + chars[i + 1]);
  }
  // Unigrams
  for (let i = 0; i < chars.length; i++) {
    terms.push(chars[i]);
  }
  return terms;
}

// ─── Extract Chinese chars from text ───
function extractChineseChars(text: string): string[] {
  const chars: string[] = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch >= '一' && ch <= '鿿') {
      chars.push(ch);
    }
  }
  return chars;
}

// ─── Load knowledge base ───
async function loadKB(): Promise<KnowledgeBase> {
  if (kbCache) return kbCache;

  const kbPath = resolve(process.cwd(), 'public', 'knowledge', 'knowledge-base.json.gz');
  console.log('[CangJingGe] Loading KB:', kbPath);

  return new Promise((resolve, reject) => {
    const bufs: Buffer[] = [];
    createReadStream(kbPath)
      .pipe(createGunzip())
      .on('data', (chunk: Buffer) => bufs.push(chunk))
      .on('end', () => {
        try {
          const json = Buffer.concat(bufs).toString('utf-8');
          kbCache = JSON.parse(json) as KnowledgeBase;
          console.log(`[CangJingGe] KB ready: ${kbCache.total_docs} chunks`);
          resolve(kbCache);
        } catch (e) {
          reject(e);
        }
      })
      .on('error', reject);
  });
}

// ─── Check if exact phrase appears in text ───
function containsPhrase(text: string, phrase: string): boolean {
  return text.indexOf(phrase) !== -1;
}

// ─── Hybrid search: BM25 + semantic expansion + phrase boost ───
function search(query: string, topN: number, kb: KnowledgeBase): SearchResult[] {
  const queryTerms = tokenize(query);
  if (queryTerms.length === 0) return [];

  // ── Semantic query expansion ──
  const expandedQueries = expandQuery(query);
  const allQueryTerms: string[] = [];
  for (const eq of expandedQueries) {
    allQueryTerms.push(...tokenize(eq));
  }
  // Deduplicate
  const uniqueQueryTerms = [...new Set(allQueryTerms)];

  console.log(`[CangJingGe] Query: "${query}" -> ${uniqueQueryTerms.length} terms (expanded from ${queryTerms.length})`);

  // Phase 1: Character set fast pre-filter (using original query chars)
  const queryChars = extractChineseChars(query);
  const candidates: Chunk[] = [];
  for (const chunk of kb.chunks) {
    let allMatch = true;
    for (const qc of queryChars) {
      if (chunk.cs.indexOf(qc) === -1) {
        allMatch = false;
        break;
      }
    }
    if (allMatch) candidates.push(chunk);
  }

  console.log(`[CangJingGe] Char filter: ${kb.chunks.length} -> ${candidates.length} candidates`);

  if (candidates.length === 0) return [];

  // Phase 2: Tokenize all candidates once
  const candidateTerms: string[][] = candidates.map(c => tokenize(c.text));

  // Phase 3: BM25 scoring with semantic expansion + phrase boost
  const avgLen = kb.avg_tc;
  const scores: { id: number; score: number; boost: number }[] = [];

  for (let i = 0; i < candidates.length; i++) {
    const chunk = candidates[i];
    const terms = candidateTerms[i];
    const docLen = terms.length;
    let score = 0;

    for (const term of uniqueQueryTerms) {
      // TF: term frequency in this chunk
      let tf = 0;
      for (const t of terms) {
        if (t === term) tf++;
      }
      if (tf === 0) continue;

      // DF: document frequency across candidates
      let df = 0;
      for (const otherTerms of candidateTerms) {
        for (const t of otherTerms) {
          if (t === term) { df++; break; }
        }
      }
      if (df === 0) continue;

      const idf = Math.log((candidates.length - df + 0.5) / (df + 0.5) + 1);
      const numerator = tf * (K1 + 1);
      const denominator = tf + K1 * (1 - B + B * (docLen / avgLen));
      score += idf * (numerator / denominator);
    }

    // ── Phrase boost: exact phrase match gets bonus ──
    let phraseBoost = 0;
    for (const eq of expandedQueries) {
      if (eq.length >= 2 && containsPhrase(chunk.text, eq)) {
        phraseBoost += 0.5; // +0.5 bonus per matched expanded phrase
      }
    }

    // ── Direct query match boost: original query appearing verbatim ──
    if (query.length >= 2 && containsPhrase(chunk.text, query)) {
      phraseBoost += 1.0;
    }

    const finalScore = score + phraseBoost;

    if (finalScore > 0) {
      scores.push({ id: chunk.id, score: finalScore, boost: phraseBoost });
    }
  }

  scores.sort((a, b) => b.score - a.score);
  const top = scores.slice(0, topN);

  return top.map((s) => {
    const chunk = kb.chunks.find((c) => c.id === s.id)!;
    const preview = chunk.text.length > 600
      ? chunk.text.slice(0, 600) + '...'
      : chunk.text;
    return {
      id: chunk.id,
      chapter: chunk.chapter || 'Unknown',
      text: preview,
      score: Math.round(s.score * 100) / 100,
    };
  });
}

// ─── Vercel Handler ───
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const start = Date.now();

  try {
    const q = (req.query.q as string) || '';
    const top = parseInt(req.query.top as string) || 5; // Default top 5

    if (!q.trim()) {
      res.json({ query: q, total_matches: 0, results: [], time_ms: Date.now() - start });
      return;
    }

    const kb = await loadKB();
    const results = search(q.trim(), Math.min(top, 10), kb);

    res.json({
      query: q,
      total_matches: kb.total_docs,
      results,
      time_ms: Date.now() - start,
    });
  } catch (e: any) {
    console.error('[CangJingGe] Search error:', e);
    res.status(500).json({
      error: 'Cang Jing Ge spiritual脉 unstable',
      detail: e.message,
    });
  }
}
