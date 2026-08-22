import { beforeEach, describe, expect, it } from "vitest";
import { api } from "../src/api/http.js";
import { chatService } from "../src/services/chatService.js";

describe("chatService", () => {
  beforeEach(() => {
    api.post.mockClear();
  });

  it("sends attachment messages as multipart form data", () => {
    const file = new File(["image-bytes"], "game.png", { type: "image/png" });
    const signal = new AbortController().signal;

    chatService.sendMessage({
      content: "What is this game?",
      conversationId: "conversation-1",
      files: [file],
      signal,
    });

    expect(api.post).toHaveBeenCalledWith(
      "/chat",
      expect.any(FormData),
      { signal },
    );

    const formData = api.post.mock.calls[0][1];
    expect(formData.get("content")).toBe("What is this game?");
    expect(formData.get("conversationId")).toBe("conversation-1");
    expect(formData.getAll("attachments")).toEqual([file]);
  });
});
