import { describe, it, expect } from "vitest";

// Extract the sanitization logic from searchPackages for unit testing.
// The regex is: /[&|!():*<>'"\\;\0]/g
function sanitizeSearchQuery(query: string): string {
  return query.replaceAll(/[&|!():*<>'"\\;\0]/g, " ").trim();
}

function toTsquery(sanitized: string): string {
  if (!sanitized) return "";
  return sanitized
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => `${w}:*`)
    .join(" & ");
}

describe("search query sanitization", () => {
  it("leaves normal query unchanged", () => {
    expect(sanitizeSearchQuery("terraform")).toBe("terraform");
  });

  it("strips single quotes", () => {
    expect(sanitizeSearchQuery("test'")).toBe("test");
  });

  it("strips backslashes", () => {
    expect(sanitizeSearchQuery("test\\")).toBe("test");
  });

  it("strips semicolons", () => {
    const result = sanitizeSearchQuery("test;DROP");
    expect(result).toBe("test DROP");
  });

  it("strips null bytes", () => {
    expect(sanitizeSearchQuery("test\0injection")).toBe("test injection");
  });

  it("strips all tsquery operators", () => {
    expect(sanitizeSearchQuery("& | ! ( ) * < >")).toBe("");
  });

  it("returns empty for all-special input", () => {
    expect(sanitizeSearchQuery(`'"\\;!*()`)).toBe("");
  });
});

describe("tsquery conversion", () => {
  it("converts single word to prefix query", () => {
    expect(toTsquery("terraform")).toBe("terraform:*");
  });

  it("converts multi-word to AND prefix query", () => {
    expect(toTsquery("hello world")).toBe("hello:* & world:*");
  });

  it("returns empty string for empty input", () => {
    expect(toTsquery("")).toBe("");
  });

  it("handles multiple spaces between words", () => {
    expect(toTsquery("  hello    world  ")).toBe("hello:* & world:*");
  });
});

describe("search end-to-end sanitization", () => {
  it("SQL injection attempt is neutralized", () => {
    const sanitized = sanitizeSearchQuery("'; DROP TABLE packages; --");
    const tsquery = toTsquery(sanitized);
    // Dangerous characters stripped, remaining words become safe tsquery
    expect(tsquery).not.toContain("DROP TABLE");
    expect(tsquery).not.toContain(";");
    expect(tsquery).not.toContain("'");
  });

  it("tsquery injection attempt is neutralized", () => {
    const sanitized = sanitizeSearchQuery("test & !valid | (injection)");
    const tsquery = toTsquery(sanitized);
    expect(tsquery).not.toContain("!");
    expect(tsquery).not.toContain("|");
    expect(tsquery).not.toContain("(");
  });
});
