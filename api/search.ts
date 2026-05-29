/**
 * Cang Jing Ge Search API - Vercel Serverless Function (V4)
 * Two-phase retrieval:
 *   1. Character set fast pre-filter (~1ms)
 *   2. Candidate tokenize + BM25 scoring
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
  for (let i = 0; i < chars.length - 1; i++) {
    terms.push(chars[i] + chars[i + 1]);
  }
  for (let i = 0; i < chars.length; i++) {
    terms.push(chars[i]);
  }
  return terms;
}

// ─── Extract Chinese chars from query ───
function extractQueryChars(query: string): string[] {
  const chars: string[] = [];
  for (let i = 0; i < query.length; i++) {
    const ch = query[i];
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

// ─── Two-phase search ───
function search(query: string, topN: number, kb: KnowledgeBase): SearchResult[] {
  const queryTerms = tokenize(query);
  if (queryTerms.length === 0) return [];

  // Phase 1: Character set fast pre-filter
  const queryChars = extractQueryChars(query);
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

  // Phase 3: BM25 scoring using pre-computed term lists
  const avgLen = kb.avg_tc;
  const scores: { id: number; score: number }[] = [];

  for (let i = 0; i < candidates.length; i++) {
    const chunk = candidates[i];
    const terms = candidateTerms[i];
    const docLen = terms.length;
    let score = 0;

    for (const term of queryTerms) {
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

    if (score > 0) {
      scores.push({ id: chunk.id, score });
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
    const top = parseInt(req.query.top as string) || 10;

    if (!q.trim()) {
      res.json({ query: q, total_matches: 0, results: [], time_ms: Date.now() - start });
      return;
    }

    const kb = await loadKB();
    const results = search(q.trim(), Math.min(top, 20), kb);

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
