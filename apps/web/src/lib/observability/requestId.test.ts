import { describe, expect, it } from "vitest";
import {
  createRequestId,
  getRequestId,
  requestIdHeaders,
  withRequestId,
  withRequestIdAsync,
} from "./requestId";

describe("requestId — correlação", () => {
  it("createRequestId gera id não vazio", () => {
    const id = createRequestId();
    expect(id.length).toBeGreaterThan(8);
  });

  it("withRequestId define e restaura o id atual", () => {
    expect(getRequestId()).toBeUndefined();
    const value = withRequestId("req-a", () => {
      expect(getRequestId()).toBe("req-a");
      return 1;
    });
    expect(value).toBe(1);
    expect(getRequestId()).toBeUndefined();
  });

  it("withRequestIdAsync propaga em await", async () => {
    await withRequestIdAsync("req-b", async () => {
      expect(getRequestId()).toBe("req-b");
      await Promise.resolve();
      expect(getRequestId()).toBe("req-b");
    });
    expect(getRequestId()).toBeUndefined();
  });

  it("requestIdHeaders usa x-request-id", () => {
    expect(requestIdHeaders("abc-123")).toEqual({ "x-request-id": "abc-123" });
  });
});
