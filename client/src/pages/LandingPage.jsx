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
            <p className="eyebrow">MERN AI chat assistant</p>
            <img className="hero-logo" src={logoPath} alt="" />
            <h1>{appName}</h1>
            <p>
              A full-stack ChatGPT-style assistant with secure authentication,
              conversation history, file attachments, admin analytics, and a
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
          <div className="hero-panel" aria-label={`${appName} preview`}>
            <div className="preview-message customer">
              Explain how APIs work in simple terms.
            </div>
            <div className="preview-message assistant">
              An API is a structured way for apps to talk to each other. Think
              of it as a menu of actions one app lets another app request.
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
            <h2>General AI chat</h2>
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
