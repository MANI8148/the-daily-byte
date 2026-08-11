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
  issueNumber: number;
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

export type ReadingMode = 'newspaper' | 'magazine' | 'archive' | 'editor';
