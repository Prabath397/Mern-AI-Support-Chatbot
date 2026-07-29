import { Link, NavLink } from "react-router-dom";
import { appName, logoPath } from "../assets/brand.js";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="navbar">
      <Link className="brand" to="/">
        <img className="brand-mark" src={logoPath} alt="" />
        <span>{appName}</span>
      </Link>
      <nav className="nav-actions" aria-label="Main navigation">
        <ThemeToggle />
        {isAuthenticated ? (
          <>
            <NavLink to="/app">Chat</NavLink>
            {user?.role === "admin" ? (
              <NavLink to="/admin">Admin</NavLink>
            ) : null}
            <NavLink to="/app/profile">Profile</NavLink>
            <button
              type="button"
              className="button button-secondary"
              onClick={logout}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Log in</NavLink>
            <NavLink className="button button-primary" to="/register">
              Get started
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
