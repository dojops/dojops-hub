import { describe, it, expect } from "vitest";
import {
  MetaSchema,
  RiskSchema,
  DopsFrontmatterSchema,
  DopsFrontmatterV2Schema,
  ContextBlockSchema,
  PermissionsSchema,
  FileSpecSchema,
} from "../dops-schema";

describe("MetaSchema", () => {
  const validMeta = {
    name: "my-tool",
    version: "1.0.0",
    description: "A test tool",
  };

  it("accepts valid meta", () => {
    expect(MetaSchema.safeParse(validMeta).success).toBe(true);
  });

  it("accepts semver with pre-release", () => {
    expect(MetaSchema.safeParse({ ...validMeta, version: "1.0.0-beta.1" }).success).toBe(true);
  });

  it("accepts semver with build metadata", () => {
    expect(MetaSchema.safeParse({ ...validMeta, version: "2.1.0+build" }).success).toBe(true);
  });

  it("rejects path traversal in version", () => {
    const result = MetaSchema.safeParse({ ...validMeta, version: "../../etc" });
    expect(result.success).toBe(false);
  });

  it("rejects empty version", () => {
    const result = MetaSchema.safeParse({ ...validMeta, version: "" });
    expect(result.success).toBe(false);
  });

  it("rejects non-semver version (alpha)", () => {
    const result = MetaSchema.safeParse({ ...validMeta, version: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects partial semver (1.0)", () => {
    const result = MetaSchema.safeParse({ ...validMeta, version: "1.0" });
    expect(result.success).toBe(false);
  });

  it("accepts valid slug name", () => {
    expect(MetaSchema.safeParse({ ...validMeta, name: "terraform-aws" }).success).toBe(true);
  });

  it("rejects name with uppercase", () => {
    const result = MetaSchema.safeParse({ ...validMeta, name: "MyTool" });
    expect(result.success).toBe(false);
  });

  it("rejects name starting with number", () => {
    const result = MetaSchema.safeParse({ ...validMeta, name: "1tool" });
    expect(result.success).toBe(false);
  });

  it("rejects name with special chars", () => {
    const result = MetaSchema.safeParse({ ...validMeta, name: "my_tool" });
    expect(result.success).toBe(false);
  });
});

describe("RiskSchema", () => {
  it("accepts valid LOW risk", () => {
    const result = RiskSchema.safeParse({ level: "LOW", rationale: "Read-only tool" });
    expect(result.success).toBe(true);
  });

  it("accepts valid MEDIUM risk", () => {
    const result = RiskSchema.safeParse({ level: "MEDIUM", rationale: "Writes files" });
    expect(result.success).toBe(true);
  });

  it("accepts valid HIGH risk", () => {
    const result = RiskSchema.safeParse({ level: "HIGH", rationale: "Executes commands" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid risk level", () => {
    const result = RiskSchema.safeParse({ level: "CRITICAL", rationale: "test" });
    expect(result.success).toBe(false);
  });
});

describe("PermissionsSchema", () => {
  it("accepts valid permissions", () => {
    const result = PermissionsSchema.safeParse({ filesystem: "write", child_process: "none" });
    expect(result.success).toBe(true);
  });

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

  it("accepts a complete valid v1 object", () => {
    const result = DopsFrontmatterSchema.safeParse(validV1);
    expect(result.success).toBe(true);
  });

  it("rejects if dops is not v1", () => {
    const result = DopsFrontmatterSchema.safeParse({ ...validV1, dops: "v2" });
    expect(result.success).toBe(false);
  });

  it("rejects if files is empty", () => {
    const result = DopsFrontmatterSchema.safeParse({ ...validV1, files: [] });
    expect(result.success).toBe(false);
  });

  it("rejects if meta is missing", () => {
    const result = DopsFrontmatterSchema.safeParse({
      dops: "v1",
      output: { type: "object" },
      files: [{ path: "output.yaml", format: "yaml" }],
    });
    expect(result.success).toBe(false);
  });
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

  it("accepts a complete valid v2 object", () => {
    const result = DopsFrontmatterV2Schema.safeParse(validV2);
    expect(result.success).toBe(true);
  });

  it("rejects if dops is not v2", () => {
    const result = DopsFrontmatterV2Schema.safeParse({ ...validV2, dops: "v1" });
    expect(result.success).toBe(false);
  });

  it("rejects if context is missing", () => {
    const result = DopsFrontmatterV2Schema.safeParse({
      dops: "v2",
      meta: { name: "test-tool-v2", version: "2.0.0", description: "A v2 test tool" },
      files: [{ path: "docker-compose.yml" }],
    });
    expect(result.success).toBe(false);
  });
});

describe("ContextBlockSchema", () => {
  it("accepts valid context block", () => {
    const result = ContextBlockSchema.safeParse({
      technology: "Kubernetes",
      fileFormat: "yaml",
      outputGuidance: "Generate a K8s deployment",
      bestPractices: ["Set resource limits", "Use readiness probes"],
    });
    expect(result.success).toBe(true);
  });

  it("accepts context block with context7Libraries", () => {
    const result = ContextBlockSchema.safeParse({
      technology: "Terraform",
      fileFormat: "hcl",
      outputGuidance: "Generate Terraform config",
      bestPractices: ["Pin provider versions"],
      context7Libraries: [{ name: "hashicorp/terraform", query: "aws provider" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty bestPractices", () => {
    const result = ContextBlockSchema.safeParse({
      technology: "Docker",
      fileFormat: "yaml",
      outputGuidance: "Generate config",
      bestPractices: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid fileFormat", () => {
    const result = ContextBlockSchema.safeParse({
      technology: "Docker",
      fileFormat: "xml",
      outputGuidance: "Generate config",
      bestPractices: ["test"],
    });
    expect(result.success).toBe(false);
  });
});

describe("FileSpecSchema", () => {
  it("accepts valid file spec", () => {
    const result = FileSpecSchema.safeParse({ path: "output.yaml", format: "yaml" });
    expect(result.success).toBe(true);
  });

  it("rejects empty path", () => {
    const result = FileSpecSchema.safeParse({ path: "", format: "yaml" });
    expect(result.success).toBe(false);
  });
});
