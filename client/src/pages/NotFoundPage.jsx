import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

export default function NotFoundPage() {
  return (
    <div>
      <Navbar />
      <main className="content-narrow center-content">
        <h1>Page not found</h1>
        <p>The page you requested is not available.</p>
        <Link className="button button-primary" to="/">
          Back home
        </Link>
      </main>
    </div>
  );
}
