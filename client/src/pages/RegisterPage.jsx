import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ErrorAlert from "../components/ErrorAlert.jsx";
import FormInput from "../components/FormInput.jsx";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useAsync } from "../hooks/useAsync.js";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const { register } = useAuth();
  const { loading, error, run } = useAsync();
  const navigate = useNavigate();

  function update(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function submit(event) {
    event.preventDefault();
    await run(() => register(form));
    navigate("/app", { replace: true });
  }

  return (
    <div className="auth-page">
      <Navbar />
      <main className="auth-card">
        <h1>Create your account</h1>
        <p>Start using your Nexia AI assistant.</p>
        <ErrorAlert message={error} />
        <form onSubmit={submit}>
          <FormInput
            label="Name"
            id="name"
            name="name"
            value={form.name}
            onChange={update}
            required
          />
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
            minLength={8}
            value={form.password}
            onChange={update}
            required
          />
          <button
            className="button button-primary button-full"
            disabled={loading}
            type="submit"
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </main>
    </div>
  );
}
