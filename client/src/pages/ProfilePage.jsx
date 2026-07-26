import { useState } from "react";
import ErrorAlert from "../components/ErrorAlert.jsx";
import FormInput from "../components/FormInput.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { authService } from "../services/authService.js";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [notice, setNotice] = useState("");
  const { loading, error, run } = useAsync();

  function update(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function submit(event) {
    event.preventDefault();
    const res = await run(() => authService.updateProfile(form));
    updateUser(res.data.data.user);
    setNotice("Profile updated successfully.");
  }

  return (
    <section className="content-narrow profile-panel">
      <h1>Profile</h1>
      <p>Manage the account details used by the chatbot workspace.</p>
      <ErrorAlert message={error} />
      {notice ? <div className="alert alert-success">{notice}</div> : null}
      <form className="panel-form" onSubmit={submit}>
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
        <button
          className="button button-primary"
          type="submit"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save profile"}
        </button>
      </form>
    </section>
  );
}
