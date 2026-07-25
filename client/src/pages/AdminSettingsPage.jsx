import { useEffect, useState } from "react";
import ErrorAlert from "../components/ErrorAlert.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { adminService } from "../services/adminService.js";
import { friendlyError } from "../utils/format.js";

export default function AdminSettingsPage() {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    adminService
      .settings()
      .then((res) => setSystemPrompt(res.data.data.setting.systemPrompt))
      .catch((err) => setError(friendlyError(err)))
      .finally(() => setLoading(false));
  }, []);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const res = await adminService.updateSettings(systemPrompt);
      setSystemPrompt(res.data.data.setting.systemPrompt);
      setNotice("System instructions updated.");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <section>
      <h1>Chatbot settings</h1>
      <p>
        Update the system instructions applied before AI responses are
        generated.
      </p>
      <ErrorAlert message={error} />
      {notice ? <div className="alert alert-success">{notice}</div> : null}
      <form className="panel-form" onSubmit={submit}>
        <label htmlFor="systemPrompt">System instructions</label>
        <textarea
          id="systemPrompt"
          rows={10}
          value={systemPrompt}
          onChange={(event) => setSystemPrompt(event.target.value)}
          minLength={20}
          required
        />
        <button
          className="button button-primary"
          type="submit"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save instructions"}
        </button>
      </form>
    </section>
  );
}
