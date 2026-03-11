import { describe, it, expect } from "vitest";
import path from "node:path";
import { getDopsFilePath, saveDopsFile, readDopsFile } from "../storage";

describe("storage - path traversal prevention", () => {
  it("returns a valid path for safe inputs", () => {
    const result = getDopsFilePath("my-tool", "1.0.0");
    expect(result).toContain("uploads");
    expect(result).toContain("my-tool");
    expect(result).toContain("1.0.0.dops");
  });

  it("throws on traversal in slug (../../etc)", () => {
    expect(() => getDopsFilePath("../../etc", "passwd")).toThrow("Path traversal blocked");
  });

  it("throws on traversal in version (../../etc/passwd)", () => {
    expect(() => getDopsFilePath("pkg", "../../etc/passwd")).toThrow("Path traversal blocked");
  });

  it("throws on traversal with deeper nesting", () => {
    expect(() => getDopsFilePath("pkg", "../../../etc/shadow")).toThrow("Path traversal blocked");
  });

  it("throws on traversal with both slug and version", () => {
    expect(() => getDopsFilePath("../evil", "../etc/passwd")).toThrow("Path traversal blocked");
  });

  it("allows dots in version that don't escape (e.g. 1.0.0-beta.1)", () => {
    const result = getDopsFilePath("my-tool", "1.0.0-beta.1");
    expect(result).toContain("1.0.0-beta.1.dops");
  });
});

describe("storage - round-trip", () => {
  it("saveDopsFile + readDopsFile round-trip works", async () => {
    const testContent = Buffer.from("dops: v2\nmeta:\n  name: test-roundtrip");
    const testSlug = `test-roundtrip-${Date.now()}`;
    const testVersion = "0.0.1";

    try {
      const relativePath = await saveDopsFile(testSlug, testVersion, testContent);
      expect(relativePath).toBe(`uploads/${testSlug}/${testVersion}.dops`);

      const read = await readDopsFile(testSlug, testVersion);
      expect(read.toString()).toBe(testContent.toString());
    } finally {
      const fs = await import("node:fs/promises");
      const uploadPath = path.join(process.cwd(), "uploads", testSlug);
      await fs.rm(uploadPath, { recursive: true, force: true }).catch(() => {});
    }
  });
});
