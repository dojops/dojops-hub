import { describe, it, expect } from "vitest";
import { parseDopsString } from "../dops-parser";

const VALID_V2_DOPS = `---
dops: v2
kind: tool
meta:
  name: test-tool-v2
  version: "2.0.0"
  description: A v2 test tool
context:
  technology: Docker
  fileFormat: yaml
  outputGuidance: Generate a docker-compose file
  bestPractices:
    - Use multi-stage builds
    - Pin image versions
files:
  - path: docker-compose.yml
risk:
  level: LOW
  rationale: Read-only tool
---
## Prompt
Generate a Docker Compose file.

## Examples
Example output here.

## Constraints
Must be valid YAML.

## Keywords
docker, compose
`;

const V1_DOPS = `---
dops: v1
kind: tool
meta:
  name: test-tool
  version: "1.0.0"
  description: A test tool
input:
  fields:
    name:
      type: string
      required: true
output:
  type: object
  properties:
    content:
      type: string
files:
  - path: output.yaml
    format: yaml
risk:
  level: LOW
  rationale: Read-only tool
---
## Prompt
Generate a config for {name}.

## Keywords
config, yaml
`;

describe("parseDopsString (v2)", () => {
  it("parses valid v2 .dops content", () => {
    const result = parseDopsString(VALID_V2_DOPS);
    expect(result.frontmatter.dops).toBe("v2");
    expect(result.frontmatter.meta.name).toBe("test-tool-v2");
    expect(result.frontmatter.meta.version).toBe("2.0.0");
    expect(result.frontmatter.meta.description).toBe("A v2 test tool");
    expect(result.frontmatter.files).toHaveLength(1);
    expect(result.frontmatter.risk?.level).toBe("LOW");
    expect(result.frontmatter.context.technology).toBe("Docker");
  });

  it("extracts prompt section", () => {
    const result = parseDopsString(VALID_V2_DOPS);
    expect(result.sections.prompt).toBe("Generate a Docker Compose file.");
  });

  it("extracts examples section", () => {
    const result = parseDopsString(VALID_V2_DOPS);
    expect(result.sections.examples).toBe("Example output here.");
  });

  it("extracts constraints section", () => {
    const result = parseDopsString(VALID_V2_DOPS);
    expect(result.sections.constraints).toBe("Must be valid YAML.");
  });

  it("extracts keywords section", () => {
    const result = parseDopsString(VALID_V2_DOPS);
    expect(result.sections.keywords).toBe("docker, compose");
  });

  it("preserves raw content", () => {
    const result = parseDopsString(VALID_V2_DOPS);
    expect(result.raw).toBe(VALID_V2_DOPS);
  });
});

describe("parseDopsString - v1 rejection", () => {
  it("rejects v1 .dops content with clear error", () => {
    expect(() => parseDopsString(V1_DOPS)).toThrow(
      "v1 .dops format is no longer supported. Please migrate to v2.",
    );
  });

  it("rejects content with no dops version field", () => {
    const content = `---
kind: tool
meta:
  name: test
  version: "1.0.0"
  description: test
files:
  - path: out.yaml
---
## Prompt
Test.
`;
    expect(() => parseDopsString(content)).toThrow(
      "v1 .dops format is no longer supported. Please migrate to v2.",
    );
  });
});

describe("parseDopsString - error cases", () => {
  it("throws on missing opening ---", () => {
    expect(() => parseDopsString("no frontmatter here")).toThrow(
      "must start with --- frontmatter delimiter",
    );
  });

  it("throws on missing closing ---", () => {
    const content = `---
dops: v2
meta:
  name: test
  version: "1.0.0"
  description: test
`;
    expect(() => parseDopsString(content)).toThrow("missing closing --- frontmatter delimiter");
  });

  it("throws on invalid YAML syntax", () => {
    const content = `---
dops: v2
meta: [invalid: {yaml
---
`;
    expect(() => parseDopsString(content)).toThrow("Invalid YAML");
  });

  it("rejects YAML anchors (JSON_SCHEMA mode)", () => {
    const content = `---
dops: v2
anchor: &default
  name: test
meta:
  <<: *default
  version: "1.0.0"
  description: test
---
`;
    expect(() => parseDopsString(content)).toThrow();
  });
});

describe("parseDopsString - edge cases", () => {
  it("returns empty sections for body with no headings", () => {
    const content = `---
dops: v2
kind: tool
meta:
  name: test-tool
  version: "1.0.0"
  description: A test tool
context:
  technology: Docker
  fileFormat: yaml
  outputGuidance: Generate config
  bestPractices:
    - test
files:
  - path: out.yaml
---
Just some text without any section headings.
`;
    const result = parseDopsString(content);
    expect(result.sections.prompt).toBe("");
    expect(result.sections.examples).toBeUndefined();
    expect(result.sections.constraints).toBeUndefined();
    expect(result.sections.keywords).toBe("");
  });
});
