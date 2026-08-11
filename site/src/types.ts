export interface Comment {
  id: string;
  author: string;
  date: string;
  message: string;
  editorResponse?: string;
  isAiResponseLoading?: boolean;
}

export interface Article {
  id: string;
  date: string; // YYYY-MM-DD
  section: 'AI & Neural Nets' | 'Cybernetics & Robotics' | 'Silicon & Quantum' | 'Editorial & Ethics' | 'Disruptions & Startups';
  title: string;
  subtitle: string;
  author: string;
  leadParagraph: string;
  bodyParagraphs: string[];
  imageUrl?: string;
  imageCaption?: string;
  sourceUrl?: string;
  sourceName?: string;
  pullQuote?: string;
  keyTakeaways?: string[];
  readTimeMinutes: number;
  likesCount: number;
  comments: Comment[];
  tags: string[];
  isHero?: boolean;
  stamp?: 'VERIFIED' | 'CONFIRMED' | 'ARCHIVED' | 'PRESS DISPATCH' | 'TOP PRIORITY' | 'EXCLUSIVE' | string;
}

export interface GazetteIssue {
  dateStr: string; // YYYY-MM-DD
  displayDate: string; // e.g. "Monday, August 10, 2026"
  issueNumber: string; // Roman numeral edition number, e.g. "XII"
  volumeNumber: string;
  weatherForecast: string;
  leadHeroArticle: Article;
  featuredArticles: Article[];
  opinionPieces: Article[];
  techBriefs: {
    headline: string;
    snippet: string;
    timeAgo: string;
    category: string;
  }[];
  marketTicker: {
    symbol: string;
    name: string;
    value: string;
    change: string;
    isPositive: boolean;
  }[];
}

export type ReadingMode = 'newspaper' | 'magazine' | 'archive';

// Newspaper section categories — the five header subsections
export interface Category {
  key: string;
  label: string;
  terms: string[];
}

export const SECTIONS: Category[] = [
  { key: 'ai', label: 'AI & ML', terms: ['ai', 'ml', 'neural', 'model', 'agent', 'llm', 'gpt', 'machine learn', 'deep learn', 'openai', 'gemini'] },
  { key: 'tech', label: 'Tech', terms: ['tech', 'hardware', 'infrastructure', 'compute', 'data center', 'chip', 'robot', 'orbital', 'neural weights'] },
  { key: 'opensource', label: 'Open Source', terms: ['open source', 'open-source', 'oss', 'free software', 'license'] },
  { key: 'github', label: 'GitHub', terms: ['github', 'repo', 'repository', 'trending', 'pull request'] },
  { key: 'devskills', label: 'Dev Skills', terms: ['skill', 'developer', 'career', 'student', 'learn', 'tutorial', 'guide', 'how to'] },
];

export const categoryMatches = (cat: Category, section: string): boolean =>
  cat.terms.some((t) => section.toLowerCase().includes(t));
