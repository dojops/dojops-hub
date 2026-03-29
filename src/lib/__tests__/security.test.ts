import { describe, it, expect } from "vitest";
import { sanitizeAvatarUrl } from "../security";

describe("sanitizeAvatarUrl", () => {
  it("accepts a valid GitHub avatar URL", () => {
    const url = "https://avatars.githubusercontent.com/u/12345?v=4";
    expect(sanitizeAvatarUrl(url)).toBe(url);
  });

  it("accepts a valid Google avatar URL", () => {
    const url = "https://lh3.googleusercontent.com/a/photo";
    expect(sanitizeAvatarUrl(url)).toBe(url);
  });

  it("returns null for null input", () => {
    expect(sanitizeAvatarUrl(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(sanitizeAvatarUrl(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(sanitizeAvatarUrl("")).toBeNull();
  });

  it("rejects http:// URLs", () => {
    expect(sanitizeAvatarUrl("http://avatars.githubusercontent.com/u/1")).toBeNull();
  });

  it("rejects arbitrary https:// URLs", () => {
    expect(sanitizeAvatarUrl("https://evil.example.com/tracking.gif")).toBeNull();
  });

  it("rejects data: URLs", () => {
    expect(sanitizeAvatarUrl("data:image/png;base64,abc")).toBeNull();
  });

  it("rejects javascript: URLs", () => {
    expect(sanitizeAvatarUrl("javascript:alert(1)")).toBeNull();
  });

  it("rejects a URL that is not parseable", () => {
    expect(sanitizeAvatarUrl("not a url at all !!!")).toBeNull();
  });

  it("rejects an allowed hostname over a disallowed protocol", () => {
    // Ensure protocol check runs before hostname check
    expect(sanitizeAvatarUrl("ftp://avatars.githubusercontent.com/u/1")).toBeNull();
  });
});
