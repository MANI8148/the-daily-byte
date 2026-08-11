import { marked } from "marked";
import type { Metadata } from "next";
import { getAllPosts, getPost, SITE } from "../../../lib/posts";
import ArticleTools from "../../components/ArticleTools";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Not found" };
  return {
    title: `${post.title} — ${SITE.name}`,
    description: post.description,
    alternates: { canonical: `https://bloggy.example.com/posts/${post.slug}` },
  };
}

export default async function Article({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return <main className="wrap"><p className="notice">Article not found.</p></main>;
  const siblings = getAllPosts().filter((p) => p.slug !== slug).slice(0, 4);

  return (
    <main className="wrap grid">
      <article>
        <div className="kicker">{post.kicker}</div>
        <h1>{post.title}</h1>
        <p className="deck">{post.description}</p>
        <div className="byline">
          <span>By <strong>{post.author}</strong> — Staff Writer</span>
          <span className="pub">{post.date}</span>
        </div>
        <ArticleTools title={post.title} body={post.body} slug={post.slug} />
        <div dangerouslySetInnerHTML={{ __html: marked.parse(post.body) as string }} />
        <div className="tags">{post.tags.map((t) => <span key={t}>{t}</span>)}</div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: post.title,
              datePublished: post.date,
              author: { "@type": "Person", name: post.author },
              description: post.description,
              keywords: post.tags,
            }),
          }}
        />
      </article>
      <aside>
        <div className="side-box">
          <h3>More in this edition</h3>
          <ul>
            {siblings.map((p) => (
              <li key={p.slug}>
                <a href={`/posts/${p.slug}`}>{p.title}</a>
                <div className="meta">{p.kicker} · {p.date}</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="side-box newsletter">
          <h3>The Weekly Byte</h3>
          <p style={{ fontSize: 14 }}>One email every Sunday: the 3 posts that mattered, one repo to star, one skill to learn.</p>
          <div className="field">
            <input type="email" placeholder="you@university.edu" />
            <button>Subscribe</button>
          </div>
        </div>
        <div className="side-box">
          <h3>From the news desk</h3>
          <p style={{ fontSize: 14 }}>Every article starts from a real source: GitHub trending, Hacker News, arXiv, and Reddit. Nothing invented; everything linked.</p>
        </div>
      </aside>
    </main>
  );
}