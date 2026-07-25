import { NavLink, Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

export default function AdminLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="admin-shell">
        <aside className="admin-nav" aria-label="Admin navigation">
          <NavLink to="/admin" end>
            Dashboard
          </NavLink>
          <NavLink to="/admin/users">Users</NavLink>
          <NavLink to="/admin/settings">Settings</NavLink>
        </aside>
        <section className="admin-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
