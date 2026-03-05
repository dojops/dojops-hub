import { describe, it, expect } from "vitest";
import { parseDopsString, parseDopsStringAny } from "../dops-parser";

const VALID_V1_DOPS = `---
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

## Examples
Example output here.

## Constraints
Must be valid YAML.

## Keywords
config, yaml
`;

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

## Keywords
docker, compose
`;

describe("parseDopsString (v1)", () => {
  it("parses valid v1 .dops content", () => {
    const result = parseDopsString(VALID_V1_DOPS);
    expect(result.frontmatter.dops).toBe("v1");
    expect(result.frontmatter.meta.name).toBe("test-tool");
    expect(result.frontmatter.meta.version).toBe("1.0.0");
    expect(result.frontmatter.meta.description).toBe("A test tool");
    expect(result.frontmatter.files).toHaveLength(1);
    expect(result.frontmatter.risk?.level).toBe("LOW");
  });

  it("extracts prompt section", () => {
    const result = parseDopsString(VALID_V1_DOPS);
    expect(result.sections.prompt).toBe("Generate a config for {name}.");
  });

  it("extracts examples section", () => {
    const result = parseDopsString(VALID_V1_DOPS);
    expect(result.sections.examples).toBe("Example output here.");
  });

  it("extracts constraints section", () => {
    const result = parseDopsString(VALID_V1_DOPS);
    expect(result.sections.constraints).toBe("Must be valid YAML.");
  });

  it("extracts keywords section", () => {
    const result = parseDopsString(VALID_V1_DOPS);
    expect(result.sections.keywords).toBe("config, yaml");
  });

  it("preserves raw content", () => {
    const result = parseDopsString(VALID_V1_DOPS);
    expect(result.raw).toBe(VALID_V1_DOPS);
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
dops: v1
meta:
  name: test
  version: "1.0.0"
  description: test
`;
    expect(() => parseDopsString(content)).toThrow("missing closing --- frontmatter delimiter");
  });

  it("throws on invalid YAML syntax", () => {
    const content = `---
dops: v1
meta: [invalid: {yaml
---
`;
    expect(() => parseDopsString(content)).toThrow("Invalid YAML");
  });

  it("rejects YAML anchors (JSON_SCHEMA mode)", () => {
    const content = `---
dops: v1
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
dops: v1
kind: tool
meta:
  name: test-tool
  version: "1.0.0"
  description: A test tool
output:
  type: object
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

describe("parseDopsStringAny", () => {
  it("auto-detects v1 format", () => {
    const result = parseDopsStringAny(VALID_V1_DOPS);
    expect(result.frontmatter.dops).toBe("v1");
  });

  it("auto-detects v2 format", () => {
    const result = parseDopsStringAny(VALID_V2_DOPS);
    expect(result.frontmatter.dops).toBe("v2");
    expect("context" in result.frontmatter).toBe(true);
  });

  it("v2 has correct meta", () => {
    const result = parseDopsStringAny(VALID_V2_DOPS);
    expect(result.frontmatter.meta.name).toBe("test-tool-v2");
    expect(result.frontmatter.meta.version).toBe("2.0.0");
  });

  it("v2 extracts sections", () => {
    const result = parseDopsStringAny(VALID_V2_DOPS);
    expect(result.sections.prompt).toBe("Generate a Docker Compose file.");
    expect(result.sections.keywords).toBe("docker, compose");
  });
});
