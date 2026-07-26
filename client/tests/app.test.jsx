import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import App from "../src/App.jsx";
import EmptyState from "../src/components/EmptyState.jsx";
import { AuthProvider } from "../src/context/AuthContext.jsx";
import { ThemeProvider } from "../src/context/ThemeContext.jsx";
import ProtectedRoute from "../src/routes/ProtectedRoute.jsx";

function renderApp(initialEntries = ["/"]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>,
  );
}

describe("SupportSphere client", () => {
  it("renders the login form", () => {
    renderApp(["/login"]);
    expect(
      screen.getByRole("heading", { name: /welcome back/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /customer/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /admin/i })).toBeInTheDocument();
  });

  it("renders the registration form", () => {
    renderApp(["/register"]);
    expect(
      screen.getByRole("heading", { name: /create your account/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
  });

  it("redirects protected routes when unauthenticated", async () => {
    localStorage.clear();
    render(
      <MemoryRouter initialEntries={["/private"]}>
        <ThemeProvider>
          <AuthProvider>
            <Routes>
              <Route
                path="/private"
                element={
                  <ProtectedRoute>
                    <div>Private content</div>
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<div>Login route</div>} />
            </Routes>
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.getByText(/login route/i)).toBeInTheDocument(),
    );
  });

  it("renders a chat empty state component", () => {
    vi.stubGlobal("localStorage", window.localStorage);
    render(
      <EmptyState
        title="Ask a support question"
        message="Use a suggested prompt."
      />,
    );
    expect(
      screen.getByRole("heading", { name: /ask a support question/i }),
    ).toBeInTheDocument();
  });
});
