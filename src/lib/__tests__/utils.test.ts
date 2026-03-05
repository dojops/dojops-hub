import { describe, it, expect } from "vitest";
import { slugify, sha256, compareSemver, sortVersionsDesc, formatBytes, timeAgo } from "../utils";

describe("slugify", () => {
  it("converts a basic name to slug", () => {
    expect(slugify("My Tool")).toBe("my-tool");
  });

  it("replaces special characters with hyphens", () => {
    expect(slugify("hello@world!foo")).toBe("hello-world-foo");
  });

  it("collapses consecutive hyphens", () => {
    expect(slugify("a---b---c")).toBe("a-b-c");
  });

  it("strips leading and trailing hyphens", () => {
    expect(slugify("--hello--")).toBe("hello");
  });

  it("handles all-special-char input", () => {
    expect(slugify("@#$%")).toBe("");
  });

  it("preserves existing valid slugs", () => {
    expect(slugify("my-tool-123")).toBe("my-tool-123");
  });
});

describe("sha256", () => {
  it("computes correct hex digest for a known input", () => {
    const hash = sha256(Buffer.from("hello"));
    expect(hash).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
  });

  it("returns different hashes for different inputs", () => {
    expect(sha256(Buffer.from("a"))).not.toBe(sha256(Buffer.from("b")));
  });
});

describe("compareSemver", () => {
  it("returns 0 for equal versions", () => {
    expect(compareSemver("1.2.3", "1.2.3")).toBe(0);
  });

  it("returns negative when a < b (major)", () => {
    expect(compareSemver("1.0.0", "2.0.0")).toBeLessThan(0);
  });

  it("returns positive when a > b (minor)", () => {
    expect(compareSemver("1.2.0", "1.1.0")).toBeGreaterThan(0);
  });

  it("returns negative when a < b (patch)", () => {
    expect(compareSemver("1.0.0", "1.0.1")).toBeLessThan(0);
  });

  it("treats missing parts as 0", () => {
    expect(compareSemver("1.0", "1.0.0")).toBe(0);
  });
});

describe("sortVersionsDesc", () => {
  it("sorts versions in descending order", () => {
    const versions = [
      { semver: "1.0.0" },
      { semver: "2.1.0" },
      { semver: "1.5.3" },
      { semver: "2.0.0" },
    ];
    const sorted = sortVersionsDesc(versions);
    expect(sorted.map((v) => v.semver)).toEqual(["2.1.0", "2.0.0", "1.5.3", "1.0.0"]);
  });

  it("handles single-element array", () => {
    const versions = [{ semver: "1.0.0" }];
    expect(sortVersionsDesc(versions)).toEqual([{ semver: "1.0.0" }]);
  });
});

describe("formatBytes", () => {
  it("formats 0 bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("formats bytes below 1KB", () => {
    expect(formatBytes(512)).toBe("512 B");
  });

  it("formats kilobytes", () => {
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
  });

  it("formats megabytes", () => {
    expect(formatBytes(1048576)).toBe("1 MB");
  });
});

describe("timeAgo", () => {
  it("returns 'just now' for recent dates", () => {
    expect(timeAgo(new Date())).toBe("just now");
  });

  it("returns minutes ago", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(timeAgo(fiveMinAgo)).toBe("5m ago");
  });

  it("returns hours ago", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3600 * 1000);
    expect(timeAgo(threeHoursAgo)).toBe("3h ago");
  });

  it("returns days ago", () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400 * 1000);
    expect(timeAgo(twoDaysAgo)).toBe("2d ago");
  });
});
