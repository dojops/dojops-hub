import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Must mock next/server before importing module
vi.mock("next/server", () => {
  class MockHeaders {
    private readonly map: Map<string, string>;
    constructor(init?: Record<string, string>) {
      this.map = new Map(Object.entries(init ?? {}));
    }
    get(name: string) {
      return this.map.get(name) ?? null;
    }
  }

  class MockNextRequest {
    headers: MockHeaders;
    constructor(_url: string, opts?: { headers?: Record<string, string> }) {
      this.headers = new MockHeaders(opts?.headers);
    }
  }

  return { NextRequest: MockNextRequest };
});

// Import after mock so the module-level setInterval doesn't break
import { getClientIp, checkRateLimit } from "../rate-limit";
import { NextRequest } from "next/server";

describe("getClientIp", () => {
  it("extracts first hop from x-forwarded-for", () => {
    const req = new NextRequest("http://localhost", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("handles single IP in x-forwarded-for", () => {
    const req = new NextRequest("http://localhost", {
      headers: { "x-forwarded-for": "10.0.0.1" },
    });
    expect(getClientIp(req)).toBe("10.0.0.1");
  });

  it("trims whitespace from XFF entries", () => {
    const req = new NextRequest("http://localhost", {
      headers: { "x-forwarded-for": "  1.2.3.4  , 5.6.7.8" },
    });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    const req = new NextRequest("http://localhost", {
      headers: { "x-real-ip": "9.8.7.6" },
    });
    expect(getClientIp(req)).toBe("9.8.7.6");
  });

  it('returns "unknown" when no headers present', () => {
    const req = new NextRequest("http://localhost");
    expect(getClientIp(req)).toBe("unknown");
  });
});

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows first request", () => {
    const result = checkRateLimit("test-first", { maxRequests: 3, windowMs: 60_000 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("decrements remaining on each request", () => {
    const config = { maxRequests: 3, windowMs: 60_000 };
    checkRateLimit("test-decrement", config);
    const result = checkRateLimit("test-decrement", config);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it("blocks when limit is reached", () => {
    const config = { maxRequests: 2, windowMs: 60_000 };
    checkRateLimit("test-block", config);
    checkRateLimit("test-block", config);
    const result = checkRateLimit("test-block", config);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("resets after window expires", () => {
    const config = { maxRequests: 1, windowMs: 10_000 };
    checkRateLimit("test-reset", config);
    const blocked = checkRateLimit("test-reset", config);
    expect(blocked.allowed).toBe(false);

    // Advance past the window
    vi.advanceTimersByTime(11_000);

    const reset = checkRateLimit("test-reset", config);
    expect(reset.allowed).toBe(true);
    expect(reset.remaining).toBe(0);
  });

  it("uses separate limits per key", () => {
    const config = { maxRequests: 1, windowMs: 60_000 };
    checkRateLimit("key-a", config);
    const result = checkRateLimit("key-b", config);
    expect(result.allowed).toBe(true);
  });
});
