/**
 * Issue builder — real content only.
 * The paper is built exclusively from Bloggy pipeline dispatches
 * (src/data/generated-content.ts). Demo/mock editions never ship:
 * if the pipeline has written nothing yet, the site shows a holding issue.
 */
import { GazetteIssue, Article } from '../types';
import { INITIAL_ISSUES } from './newspaperData';
import { PIPELINE_ARTICLES, PIPELINE_LATEST_DATE } from './generated-content';

const DEFAULT_DATE = '2026-08-10';

function fmtDisplay(dateStr: string): string {
  try {
    const d = new Date(`${dateStr}T00:00:00`);
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return `Edition of ${dateStr}`;
  }
}

function roman(n: number): string {
  const table: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
    [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let out = '';
  for (const [v, s] of table) {
    while (n >= v) {
      out += s;
      n -= v;
    }
  }
  return out;
}

function buildPipelineIssue(dateStr: string, dayArticles: Article[], edition: number): GazetteIssue {
  const [hero, ...rest] = dayArticles;
  const featured = rest.slice(0, 4);
  const briefs = rest.slice(4).map((a) => ({
    headline: a.title.replace(/:.*$/, '').slice(0, 60),
    snippet: (a.subtitle || a.leadParagraph).slice(0, 110),
    timeAgo: 'PIPELINE',
    category: a.section.replace(' & ', '/'),
  }));

  return {
    dateStr,
    displayDate: fmtDisplay(dateStr),
    issueNumber: roman(edition),
    volumeNumber: 'BYTE-' + roman(edition),
    weatherForecast: 'News Wire: High Throughput / Clear Headlines',
    leadHeroArticle: { ...hero, isHero: true },
    featuredArticles: featured,
    opinionPieces: [],
    techBriefs: briefs,
    marketTicker: [],
  };
}

export function buildInitialIssues(): Record<string, GazetteIssue> {
  if (!PIPELINE_ARTICLES.length) return INITIAL_ISSUES; // holding page only until first real dispatch

  const byDate: Record<string, Article[]> = {};
  for (const a of PIPELINE_ARTICLES) {
    (byDate[a.date] ||= []).push(a);
  }

  const pipelineIssues: Record<string, GazetteIssue> = {};
  const dates = Object.keys(byDate).sort().reverse(); // every real edition — archive is date-complete
  const total = dates.length;
  dates.forEach((d, idx) => {
    pipelineIssues[d] = buildPipelineIssue(d, byDate[d], total - idx); // oldest = edition I
  });
  return pipelineIssues; // real dispatches only — no demo editions in the paper
}

export function buildInitialDate(): string {
  return PIPELINE_LATEST_DATE || DEFAULT_DATE;
}
