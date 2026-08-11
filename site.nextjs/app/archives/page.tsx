import type { Metadata } from "next";
import { getAllPosts, SITE } from "../../lib/posts";

export const metadata: Metadata = {
  title: `Edition Archives — ${SITE.name}`,
  description: "Every edition The Daily Byte has published, in the order it went to press.",
};

export default function Archives() {
  const posts = getAllPosts();
  const byDate = new Map<string, typeof posts>();
  for (const p of posts) {
    const list = byDate.get(p.date) || [];
    list.push(p);
    byDate.set(p.date, list);
  }

  return (
    <main className="wrap">
      <div className="kicker">The Daily Byte · Historical Repository</div>
      <h1 style={{ fontSize: "2.2rem", lineHeight: 1.1, margin: "8px 0 4px" }}>Editions Archive</h1>
      <p className="deck" style={{ marginBottom: 24 }}>
        Pipeline dispatches in issue order — every edition is also available in the{" "}
        <a href="/magazine" style={{ textDecoration: "underline" }}>brochure magazine reader</a>.
      </p>

      {[...byDate.entries()].map(([date, items]) => (
        <section key={date} style={{ marginBottom: 28 }}>
          <div className="kicker-s" style={{ marginBottom: 6 }}>{date}</div>
          {items.map((p) => (
            <div className="story" key={p.slug} style={{ marginBottom: 10 }}>
              <div className="kicker-s">{p.kicker}</div>
              <a className="head" href={`/posts/${p.slug}`}>{p.title}</a>
              <p className="standfirst">{p.description}</p>
              <div className="byline-s">{p.author} · {p.date}</div>
            </div>
          ))}
        </section>
      ))}

      {posts.length === 0 && (
        <p className="notice">The archive is empty — the worker is still at the news desk.</p>
      )}
    </main>
  );
}