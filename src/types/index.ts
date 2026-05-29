export interface Character {
  id: string;
  name: string;
  nameEn: string;
  aliases: string[];
  aliasesEn: string[];
  realm: string;
  realmEn: string;
  imageUrl?: string;
  affiliation: string;
  affiliationEn: string;
  description: string;
  descriptionEn: string;
  personality: string;
  personalityEn: string;
  techniques: string[];
  techniquesEn?: string[];
  relations: { targetId: string; targetName: string; targetNameEn?: string; relation: string; relationEn: string }[];
  firstAppearChapter: string;
  firstAppearChapterEn: string;
  status: 'alive' | 'deceased' | 'departed';
  tags: string[];
  ending: string;
  endingEn: string;
}

export interface Artifact {
  id: string;
  name: string;
  nameEn: string;
  type: string;
  typeEn?: string;
  grade?: string;
  gradeEn?: string;
  imageUrl?: string;
  owner?: string;
  ownerEn?: string;
  ownerId?: string;
  ownerName?: string;
  ownerNameEn?: string;
  description: string;
  descriptionEn: string;
  abilities: string[];
  abilitiesEn: string[];
  acquisition?: string;
  acquisitionEn?: string;
  firstAppearChapter: string;
  firstAppearChapterEn: string;
  notableUsage?: string;
  notableUsageEn?: string;
}

export interface TimelineEvent {
  id: string;
  sortOrder: number;
  title: string;
  titleEn: string;
  timeLabel: string;
  timeLabelEn: string;
  chapter: string;
  chapterEn: string;
  type: string;
  location: string;
  locationEn: string;
  relatedCharacterIds: string[];
  relatedArtifactIds: string[];
  description: string;
  descriptionEn: string;
  positionPercent: { x: number; y: number };
  branchIndex: number;
}

export interface SearchResult {
  id: number;
  chapter: string;
  text: string;
  score: number;
}

export interface SearchResponse {
  query: string;
  total_matches: number;
  results: SearchResult[];
  time_ms: number;
}

export interface SiteStatistics {
  bilibiliSeriesViews: number;
  bilibiliFavorites: number;
  bilibiliRating: number;
  doubanRating: number;
  seasonCount: number;
  totalEpisodes: number;
  yearStart: number;
  duration: string;
  durationEn: string;
  startDate: string;
  startDateEn: string;
}

export interface Honor {
  id: string;
  title: string;
  titleEn?: string;
  issuer: string;
  issuerEn?: string;
  year: number;
  description: string;
  descriptionEn?: string;
}
