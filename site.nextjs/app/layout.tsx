import type { Metadata } from "next";
import { SITE } from "../lib/posts";
import "./globals.css";

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: `${SITE.tagline}: AI, ML, open source, tech news and skills for students worldwide.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&family=Archivo:wght@500;600;700&family=JetBrains+Mono:wght@400;600&family=Cinzel:wght@700;900&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&family=UnifrakturMaguntia&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/style.css" />
      </head>
      <body>
        <div className="dateline">
          <div className="wrap">
            <span>{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
            <span>{SITE.tagline} · Read by students in 40+ countries</span>
          </div>
        </div>
        <header className="masthead">
          <div className="kicker-bar">The Independent Student Review of Technology</div>
          <h1>{SITE.name}</h1>
          <div className="tagline">AI · ML · Open Source · Tech News · Skills</div>
          <div className="double-rule"></div>
        </header>
        <nav className="sections">
          <div className="wrap">
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/magazine">Magazine</a></li>
              <li><a href="/puzzles">Puzzles</a></li>
              <li><a href="/press-room">Press Room</a></li>
              <li><a href="/archives">Archives</a></li>
              <li><a href="/desk">AI Desk</a></li>
            </ul>
          </div>
        </nav>
        {children}
        <footer>
          <div className="wrap">
            <div className="cols">
              <div>
                <h4>{SITE.name}</h4>
                <p style={{ fontSize: 13, lineHeight: 1.7 }}>Fetched, written, checked, and published by the Bloggy pipeline. Source-linked journalism for students.</p>
              </div>
              <div>
                <h4>Sections</h4>
                <ul>
                  <li><a href="/magazine">Brochure Magazine</a></li>
                  <li><a href="/puzzles">Pastimes & Puzzles</a></li>
                  <li><a href="/press-room">Press Room</a></li>
                  <li><a href="/archives">Edition Archives</a></li>
                  <li><a href="/desk">AI Publishing Desk</a></li>
                </ul>
              </div>
              <div>
                <h4>Resources</h4>
                <ul><li><a href="#">Roadmaps</a></li><li><a href="#">Cheat sheets</a></li><li><a href="#">Repo of the week</a></li><li><a href="#">Newsletter archive</a></li></ul>
              </div>
              <div>
                <h4>Connect</h4>
                <ul><li><a href="#">GitHub</a></li><li><a href="#">X / Twitter</a></li><li><a href="#">LinkedIn</a></li><li><a href="#">Bluesky</a></li></ul>
              </div>
            </div>
            <div className="copyright">© {new Date().getFullYear()} {SITE.name} · Built with the Bloggy pipeline</div>
          </div>
        </footer>
      </body>
    </html>
  );
}