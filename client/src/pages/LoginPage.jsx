import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ErrorAlert from "../components/ErrorAlert.jsx";
import FormInput from "../components/FormInput.jsx";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useAsync } from "../hooks/useAsync.js";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login } = useAuth();
  const { loading, error, run } = useAsync();
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
    await run(() => login(form));
    navigate(location.state?.from?.pathname || "/app", { replace: true });
  }

  return (
    <div className="auth-page">
      <Navbar />
      <main className="auth-card">
        <h1>Welcome back</h1>
        <p>Log in to continue customer support conversations.</p>
        <ErrorAlert message={error} />
        <form onSubmit={submit}>
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
