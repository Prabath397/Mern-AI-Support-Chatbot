import { useState } from "react";

export function useAsync() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run(action) {
    setLoading(true);
    setError("");
    try {
      return await action();
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Something went wrong.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, setError, run };
}
