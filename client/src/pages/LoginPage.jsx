import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ErrorAlert from "../components/ErrorAlert.jsx";
import FormInput from "../components/FormInput.jsx";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useAsync } from "../hooks/useAsync.js";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [selectedRole, setSelectedRole] = useState("user");
  const { login, logout } = useAuth();
  const { loading, error, setError, run } = useAsync();
  const navigate = useNavigate();
  const location = useLocation();

  function update(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function submit(event) {
    event.preventDefault();
    const signedInUser = await run(() => login(form));

    if (signedInUser.role !== selectedRole) {
      logout();
      setError(
        selectedRole === "admin"
          ? "This account is not an admin account."
          : "This account is an admin account. Use Admin login instead.",
      );
      return;
    }

    const fallbackPath = selectedRole === "admin" ? "/admin" : "/app";
    const requestedPath = location.state?.from?.pathname;
    const destination =
      selectedRole === "admin" && requestedPath?.startsWith("/admin")
        ? requestedPath
        : fallbackPath;

    navigate(destination, { replace: true });
  }

  return (
    <div className="auth-page">
      <Navbar />
      <main className="auth-card">
        <h1>Welcome back</h1>
        <p>Log in to continue customer support conversations.</p>
        <ErrorAlert message={error} />
        <form onSubmit={submit}>
          <fieldset className="role-selector">
            <legend>Login as</legend>
            <div>
              <button
                type="button"
                className={selectedRole === "user" ? "active" : ""}
                onClick={() => setSelectedRole("user")}
                aria-pressed={selectedRole === "user"}
              >
                Customer
              </button>
              <button
                type="button"
                className={selectedRole === "admin" ? "active" : ""}
                onClick={() => setSelectedRole("admin")}
                aria-pressed={selectedRole === "admin"}
              >
                Admin
              </button>
            </div>
          </fieldset>
          <FormInput
            label="Email"
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={update}
            required
          />
          <FormInput
            label="Password"
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={update}
            required
          />
          <button
            className="button button-primary button-full"
            disabled={loading}
            type="submit"
          >
            {loading ? "Signing in..." : "Log in"}
          </button>
        </form>
        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </main>
    </div>
  );
}
