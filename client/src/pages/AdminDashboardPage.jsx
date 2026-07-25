import { useEffect, useState } from "react";
import ErrorAlert from "../components/ErrorAlert.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { adminService } from "../services/adminService.js";
import { formatDate, friendlyError } from "../utils/format.js";

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminService
      .dashboard()
      .then((res) => setDashboard(res.data.data))
      .catch((err) => setError(friendlyError(err)));
  }, []);

  if (!dashboard && !error) return <LoadingSpinner />;

  return (
    <section>
      <h1>Admin dashboard</h1>
      <ErrorAlert message={error} />
      {dashboard ? (
        <>
          <div className="stats-grid">
            <article>
              <span>Total users</span>
              <strong>{dashboard.totals.users}</strong>
            </article>
            <article>
              <span>Conversations</span>
              <strong>{dashboard.totals.conversations}</strong>
            </article>
            <article>
              <span>Messages</span>
              <strong>{dashboard.totals.messages}</strong>
            </article>
            <article>
              <span>Avg messages/chat</span>
              <strong>
                {dashboard.analytics.averageMessagesPerConversation}
              </strong>
            </article>
          </div>
          <h2>Recent users</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recentUsers.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </section>
  );
}
