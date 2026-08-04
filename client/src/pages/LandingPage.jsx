import { Link } from "react-router-dom";
import { appName, logoPath } from "../assets/brand.js";
import Navbar from "../components/Navbar.jsx";

export default function LandingPage() {
  return (
    <div className="marketing-page">
      <Navbar />
      <main>
        <section className="hero">
          <div className="hero-content">
            <p className="eyebrow">Your AI chat assistant</p>
            <img className="hero-logo" src={logoPath} alt="" />
            <h1>{appName}</h1>
            <p>
              Ask questions, brainstorm ideas, summarize files, save your chat
              history, and get clear answers whenever you need them.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" to="/register">
                Create account
              </Link>
              <Link className="button button-secondary" to="/login">
                Log in
              </Link>
            </div>
          </div>
          <div className="hero-panel" aria-label={`${appName} preview`}>
            <div className="preview-message customer">
              Help me write a study plan for this week.
            </div>
            <div className="preview-message assistant">
              Absolutely. Tell me your subjects, deadlines, and the time you
              have each day, and I will turn it into a simple plan you can
              follow.
            </div>
            <div className="metric-row">
              <span>Saved chats</span>
              <span>File uploads</span>
            </div>
          </div>
        </section>
        <section className="feature-grid">
          <article>
            <h2>Everyday AI chat</h2>
            <p>
              Ask for explanations, ideas, summaries, drafts, code help, or
              step-by-step guidance in one clean chat space.
            </p>
          </article>
          <article>
            <h2>Private workspace</h2>
            <p>
              Create your own account, keep conversations organized, and return
              to previous chats whenever you need them.
            </p>
          </article>
          <article>
            <h2>Helpful controls</h2>
            <p>
              Upload supported files, copy useful answers, switch themes, and
              manage assistant settings from the dashboard.
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}
