import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";

describe("API smoke and security behavior", () => {
  it("returns health status", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("ok");
  });

  it("rejects invalid registration payloads before database access", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "A",
      email: "not-an-email",
      password: "short",
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects invalid login payloads before database access", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "bad",
      password: "",
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects protected routes without a token", async () => {
    const res = await request(app).get("/api/users/profile");
    expect(res.status).toBe(401);
  });

  it("rejects admin routes without authentication", async () => {
    const res = await request(app).get("/api/admin/dashboard");
    expect(res.status).toBe(401);
  });
});
