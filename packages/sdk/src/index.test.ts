import { describe, it, expect } from "vitest";
import {
  KaidonClient,
  KaidonError,
  createKaidon,
} from "./index";

describe("KaidonClient", () => {
  it("should create client with default config", () => {
    const client = new KaidonClient();
    expect(client).toBeDefined();
  });

  it("should create client with custom config", () => {
    const client = new KaidonClient({
      baseUrl: "http://custom:9000",
      timeout: 5000,
      headers: { "X-Custom": "test" },
    });
    expect(client).toBeDefined();
  });

  it("should create client via factory", () => {
    const client = createKaidon({ baseUrl: "http://test:3000" });
    expect(client).toBeInstanceOf(KaidonClient);
  });

  it("should set session token", () => {
    const client = new KaidonClient();
    client.setSession("sess_test123");
    // Internal state is private, but we can verify it doesn't throw
    expect(client).toBeDefined();
  });
});

describe("KaidonError", () => {
  it("should create error with status and data", () => {
    const error = new KaidonError("Not found", 404, { detail: "missing" });
    expect(error.message).toBe("Not found");
    expect(error.status).toBe(404);
    expect(error.data).toEqual({ detail: "missing" });
    expect(error.name).toBe("KaidonError");
  });

  it("should be instance of Error", () => {
    const error = new KaidonError("test", 500);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(KaidonError);
  });
});
