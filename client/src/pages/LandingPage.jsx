import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

export default function LandingPage() {
  return (
    <div className="marketing-page">
      <Navbar />
      <main>
        <section className="hero">
          <div className="hero-content">
            <p className="eyebrow">MERN customer support assistant</p>
            <h1>SupportSphere AI</h1>
            <p>
              A full-stack chatbot platform for support teams, with secure
              authentication, conversation history, admin analytics, and a
              backend-only AI provider layer.
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
          <div className="hero-panel" aria-label="SupportSphere AI preview">
            <div className="preview-message customer">
              My order status has not updated in 3 days.
            </div>
            <div className="preview-message assistant">
              I can help check likely causes, confirm the order ID, and suggest
              the best escalation path.
            </div>
            <div className="metric-row">
              <span>JWT Auth</span>
              <span>MongoDB Atlas</span>
              <span>Mock AI Ready</span>
            </div>
          </div>
        </section>
        <section className="feature-grid">
          <article>
            <h2>Agent-grade chat</h2>
            <p>
              Markdown, code blocks, copy actions, saved history, deterministic
              titles, and responsive layouts.
            </p>
          </article>
          <article>
            <h2>Secure API</h2>
            <p>
              Express 5, Helmet, CORS, rate limits, validation, JWT auth, role
              checks, and centralized errors.
            </p>
          </article>
          <article>
            <h2>Admin controls</h2>
            <p>
              Usage counts, recent users, activation controls, and editable
              chatbot system instructions.
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}
