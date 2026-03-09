import { describe, it, expect } from "vitest";
import type { ZodTypeAny } from "zod";
import {
  MetaSchema,
  RiskSchema,
  DopsFrontmatterSchema,
  DopsFrontmatterV2Schema,
  ContextBlockSchema,
  PermissionsSchema,
  FileSpecSchema,
  CapabilitiesSchema,
  OutputSchemaSchema,
} from "../dops-schema";

// Helpers to reduce repetition
function expectValid(schema: ZodTypeAny, data: unknown) {
  expect(schema.safeParse(data).success).toBe(true);
}
function expectInvalid(schema: ZodTypeAny, data: unknown) {
  expect(schema.safeParse(data).success).toBe(false);
}

describe("MetaSchema", () => {
  const validMeta = { name: "my-tool", version: "1.0.0", description: "A test tool" };

  it("accepts valid meta", () => expectValid(MetaSchema, validMeta));
  it("accepts semver with pre-release", () =>
    expectValid(MetaSchema, { ...validMeta, version: "1.0.0-beta.1" }));
  it("accepts semver with build metadata", () =>
    expectValid(MetaSchema, { ...validMeta, version: "2.1.0+build" }));
  it("accepts non-semver version strings", () =>
    expectValid(MetaSchema, { ...validMeta, version: "latest" }));
  it("accepts partial version (1.0)", () =>
    expectValid(MetaSchema, { ...validMeta, version: "1.0" }));
  it("rejects empty version", () => expectInvalid(MetaSchema, { ...validMeta, version: "" }));
  it("accepts valid slug name", () =>
    expectValid(MetaSchema, { ...validMeta, name: "terraform-aws" }));
  it("rejects name with uppercase", () =>
    expectInvalid(MetaSchema, { ...validMeta, name: "MyTool" }));
  it("rejects name starting with number", () =>
    expectInvalid(MetaSchema, { ...validMeta, name: "1tool" }));
  it("rejects name with special chars", () =>
    expectInvalid(MetaSchema, { ...validMeta, name: "my_tool" }));
  it("accepts HTTPS icon URL", () =>
    expectValid(MetaSchema, { ...validMeta, icon: "https://example.com/icon.png" }));
  it("rejects HTTP icon URL", () =>
    expectInvalid(MetaSchema, { ...validMeta, icon: "http://example.com/icon.png" }));
});

describe("RiskSchema", () => {
  it("accepts valid LOW risk", () =>
    expectValid(RiskSchema, { level: "LOW", rationale: "Read-only tool" }));
  it("accepts valid MEDIUM risk", () =>
    expectValid(RiskSchema, { level: "MEDIUM", rationale: "Writes files" }));
  it("accepts valid HIGH risk", () =>
    expectValid(RiskSchema, { level: "HIGH", rationale: "Executes commands" }));
  it("rejects invalid risk level", () =>
    expectInvalid(RiskSchema, { level: "CRITICAL", rationale: "test" }));
});

describe("PermissionsSchema", () => {
  it("accepts valid permissions", () =>
    expectValid(PermissionsSchema, { filesystem: "write", child_process: "none" }));

  it("uses defaults", () => {
    const result = PermissionsSchema.safeParse({});
    expect(result.success).toBe(true);
    expect(result.data?.filesystem).toBe("write");
    expect(result.data?.child_process).toBe("none");
    expect(result.data?.network).toBe("none");
  });
});

describe("DopsFrontmatterSchema (v1)", () => {
  const validV1 = {
    dops: "v1",
    meta: { name: "test-tool", version: "1.0.0", description: "A test tool" },
    output: { type: "object" },
    files: [{ path: "output.yaml", format: "yaml" }],
  };

  it("accepts a complete valid v1 object", () => expectValid(DopsFrontmatterSchema, validV1));
  it("rejects if dops is not v1", () =>
    expectInvalid(DopsFrontmatterSchema, { ...validV1, dops: "v2" }));
  it("rejects if files is empty", () =>
    expectInvalid(DopsFrontmatterSchema, { ...validV1, files: [] }));
  it("rejects if meta is missing", () =>
    expectInvalid(DopsFrontmatterSchema, {
      dops: "v1",
      output: { type: "object" },
      files: [{ path: "output.yaml", format: "yaml" }],
    }));
});

describe("DopsFrontmatterV2Schema", () => {
  const validV2 = {
    dops: "v2",
    meta: { name: "test-tool-v2", version: "2.0.0", description: "A v2 test tool" },
    context: {
      technology: "Docker",
      fileFormat: "yaml",
      outputGuidance: "Generate docker-compose",
      bestPractices: ["Use multi-stage builds"],
    },
    files: [{ path: "docker-compose.yml" }],
  };

  it("accepts a complete valid v2 object", () => expectValid(DopsFrontmatterV2Schema, validV2));
  it("rejects if dops is not v2", () =>
    expectInvalid(DopsFrontmatterV2Schema, { ...validV2, dops: "v1" }));
  it("rejects if context is missing", () =>
    expectInvalid(DopsFrontmatterV2Schema, {
      dops: "v2",
      meta: { name: "test-tool-v2", version: "2.0.0", description: "A v2 test tool" },
      files: [{ path: "docker-compose.yml" }],
    }));
});

describe("ContextBlockSchema", () => {
  const baseContext = {
    technology: "Docker",
    fileFormat: "yaml",
    outputGuidance: "Generate config",
    bestPractices: ["test"],
  };

  it("accepts valid context block", () =>
    expectValid(ContextBlockSchema, {
      technology: "Kubernetes",
      fileFormat: "yaml",
      outputGuidance: "Generate a K8s deployment",
      bestPractices: ["Set resource limits", "Use readiness probes"],
    }));

  it("accepts context block with context7Libraries", () =>
    expectValid(ContextBlockSchema, {
      technology: "Terraform",
      fileFormat: "hcl",
      outputGuidance: "Generate Terraform config",
      bestPractices: ["Pin provider versions"],
      context7Libraries: [{ name: "hashicorp/terraform", query: "aws provider" }],
    }));

  it("rejects empty bestPractices", () =>
    expectInvalid(ContextBlockSchema, { ...baseContext, bestPractices: [] }));

  it("rejects invalid fileFormat", () =>
    expectInvalid(ContextBlockSchema, { ...baseContext, fileFormat: "xml" }));
});

describe("FileSpecSchema", () => {
  it("accepts valid file spec", () =>
    expectValid(FileSpecSchema, { path: "output.yaml", format: "yaml" }));
  it("rejects empty path", () => expectInvalid(FileSpecSchema, { path: "", format: "yaml" }));
});

describe("CapabilitiesSchema", () => {
  it("accepts valid capabilities", () =>
    expectValid(CapabilitiesSchema, { sideEffects: "filesystem", runtime: "short" }));
  it("accepts network side effects", () =>
    expectValid(CapabilitiesSchema, { sideEffects: "network", runtime: "long" }));
  it("uses defaults for empty object", () => {
    const result = CapabilitiesSchema.safeParse({});
    expect(result.success).toBe(true);
    expect(result.data?.sideEffects).toBe("filesystem");
    expect(result.data?.runtime).toBe("short");
  });
  it("rejects invalid sideEffects", () =>
    expectInvalid(CapabilitiesSchema, { sideEffects: "database" }));
});

describe("OutputSchemaSchema", () => {
  it("accepts schema with enum and format", () =>
    expectValid(OutputSchemaSchema, {
      type: "object",
      properties: {
        status: { type: "string", enum: ["active", "inactive"], default: "active" },
        port: { type: "number", minimum: 1, maximum: 65535 },
      },
    }));
  it("accepts schema with anyOf", () =>
    expectValid(OutputSchemaSchema, {
      anyOf: [{ type: "string", format: "date-time" }, { type: "null" }],
    }));
  it("accepts schema with pattern and length constraints", () =>
    expectValid(OutputSchemaSchema, {
      type: "string",
      pattern: "^[a-z]+$",
      minLength: 1,
      maxLength: 64,
    }));
});
