import { getAllPosts, SITE } from "../lib/posts";

export default function Home() {
  const posts = getAllPosts();
  const [lead, ...rest] = posts;
  return (
    <main>
      {lead ? (
        <div className="front-grid">
          <div className="lead-story" style={{ position: "relative" }}>
            <span className="ink-stamp" style={{ position: "absolute", top: 4, right: 4 }}>Pipeline Dispatch</span>
            <div className="kicker-s">{lead.kicker}</div>
            <a className="head" href={`/posts/${lead.slug}`}>{lead.title}</a>
            <p className="standfirst">{lead.description}</p>
            <div className="byline-s">{lead.author} · {lead.date}</div>
          </div>
          {rest.map((p) => (
            <div className="story" key={p.slug}>
              <div className="kicker-s">{p.kicker}</div>
              <a className="head" href={`/posts/${p.slug}`}>{p.title}</a>
              <p className="standfirst">{p.description}</p>
              <div className="byline-s">{p.author} · {p.date}</div>
            </div>
          ))}
        </div>
      ) : (
        <p className="notice">No articles yet — the worker is at the news desk. Check back after the first pipeline run.</p>
      )}
      <div className="side-box">
        <h3>From the press room</h3>
        <p style={{ fontSize: 14 }}>
          Read today&apos;s edition as a <a href="/magazine" style={{ textDecoration: "underline" }}>flip-page magazine</a>,
          tackle the <a href="/puzzles" style={{ textDecoration: "underline" }}>crossword & sudoku</a>,
          watch it hit the <a href="/press-room" style={{ textDecoration: "underline" }}>press sheet</a>,
          or draft a dispatch at the <a href="/desk" style={{ textDecoration: "underline" }}>AI writing desk</a>.
        </p>
      </div>
      <div className="side-box newsletter">
        <h3>The Weekly Byte</h3>
        <p style={{ fontSize: 14 }}>One email every Sunday: the 3 posts that mattered, one repo to star, one skill to learn.</p>
        <div className="field">
          <input type="email" placeholder="you@university.edu" />
          <button>Subscribe</button>
        </div>
      </div>
    </main>
  );
}