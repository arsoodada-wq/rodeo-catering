import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const streamMock = vi.fn();
vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn().mockImplementation(function AnthropicMock() {
    return { messages: { stream: streamMock } };
  }),
}));

const executeConciergeTool = vi.fn();
vi.mock("@/lib/ai/tools", () => ({
  conciergeTools: [],
  executeConciergeTool: (...args: unknown[]) => executeConciergeTool(...args),
}));

import { runConciergeTurnStream } from "./concierge";

const ORIGINAL_ENV = { ...process.env };

// Mimics the real SDK's stream object closely enough for this loop:
// `.on("text", cb)` fires every delta synchronously, `.finalMessage()`
// resolves the complete message.
function fakeStream(deltas: string[], finalMessage: unknown) {
  return {
    on(event: string, cb: (text: string) => void) {
      if (event === "text") {
        for (const delta of deltas) cb(delta);
      }
      return this;
    },
    finalMessage: async () => finalMessage,
  };
}

describe("runConciergeTurnStream", () => {
  beforeEach(() => {
    streamMock.mockReset();
    executeConciergeTool.mockReset();
    process.env = { ...ORIGINAL_ENV, ANTHROPIC_API_KEY: "test-key" };
  });
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("throws when ANTHROPIC_API_KEY is not configured", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    await expect(runConciergeTurnStream([{ role: "user", content: "hi" }], vi.fn())).rejects.toThrow(
      /ANTHROPIC_API_KEY/
    );
  });

  it("streams deltas as they arrive and returns the final reply", async () => {
    streamMock.mockReturnValueOnce(
      fakeStream(["Hello", " there!"], {
        stop_reason: "end_turn",
        content: [{ type: "text", text: "Hello there!" }],
      })
    );

    const deltas: string[] = [];
    const result = await runConciergeTurnStream([{ role: "user", content: "hi" }], (text) =>
      deltas.push(text)
    );

    expect(deltas).toEqual(["Hello", " there!"]);
    expect(result).toEqual({ reply: "Hello there!", leadSubmitted: false });
  });

  it("executes a tool call and continues the loop to a final answer", async () => {
    streamMock
      .mockReturnValueOnce(
        fakeStream([], {
          stop_reason: "tool_use",
          content: [
            { type: "tool_use", id: "tool-1", name: "submit_catering_lead", input: { name: "Jane" } },
          ],
        })
      )
      .mockReturnValueOnce(
        fakeStream(["All set!"], {
          stop_reason: "end_turn",
          content: [{ type: "text", text: "All set!" }],
        })
      );
    executeConciergeTool.mockResolvedValueOnce({ ok: true, leadId: "lead-1" });

    const result = await runConciergeTurnStream([{ role: "user", content: "book it" }], vi.fn());

    expect(executeConciergeTool).toHaveBeenCalledWith("submit_catering_lead", { name: "Jane" });
    expect(result).toEqual({ reply: "All set!", leadSubmitted: true });
  });

  it("does not mark a lead submitted when the tool call fails", async () => {
    streamMock
      .mockReturnValueOnce(
        fakeStream([], {
          stop_reason: "tool_use",
          content: [{ type: "tool_use", id: "tool-1", name: "submit_catering_lead", input: {} }],
        })
      )
      .mockReturnValueOnce(
        fakeStream(["Let's try that again."], {
          stop_reason: "end_turn",
          content: [{ type: "text", text: "Let's try that again." }],
        })
      );
    executeConciergeTool.mockResolvedValueOnce({ ok: false, error: "Missing required field." });

    const result = await runConciergeTurnStream([{ role: "user", content: "book it" }], vi.fn());

    expect(result.leadSubmitted).toBe(false);
  });

  it("falls back with a phone-call suggestion after too many tool iterations", async () => {
    streamMock.mockReturnValue(
      fakeStream([], {
        stop_reason: "tool_use",
        content: [{ type: "tool_use", id: "tool-1", name: "get_service_areas", input: {} }],
      })
    );
    executeConciergeTool.mockResolvedValue({ homeBase: "Worth, IL", confirmedAreas: [] });

    const deltas: string[] = [];
    const result = await runConciergeTurnStream([{ role: "user", content: "hi" }], (text) =>
      deltas.push(text)
    );

    expect(result.reply).toMatch(/call us directly/);
    expect(deltas[deltas.length - 1]).toBe(result.reply);
  });
});
