import * as yaml from "js-yaml";
import { DopsFrontmatterSchema, type DopsModule, type MarkdownSections } from "./dops-schema";

const FRONTMATTER_DELIMITER = "---";

/**
 * Parse a .dops file from string content (v2 only).
 * Throws if the content is v1 format or invalid.
 */
export function parseDopsString(content: string): DopsModule {
  const { frontmatterRaw, body } = splitFrontmatter(content);

  let frontmatterData: unknown;
  try {
    frontmatterData = yaml.load(frontmatterRaw, { schema: yaml.JSON_SCHEMA });
  } catch (err) {
    throw new Error(`Invalid YAML in frontmatter: ${(err as Error).message}`, { cause: err });
  }

  const version = (frontmatterData as Record<string, unknown>)?.dops;
  if (version !== "v2") {
    throw new Error("v1 .dops format is no longer supported. Please migrate to v2.");
  }

  const parseResult = DopsFrontmatterSchema.safeParse(frontmatterData);
  if (!parseResult.success) {
    const errors = parseResult.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    throw new Error(`Invalid DOPS frontmatter:\n  ${errors.join("\n  ")}`);
  }

  const sections = parseMarkdownSections(body);

  return {
    frontmatter: parseResult.data,
    sections,
    raw: content,
  };
}

function splitFrontmatter(content: string): {
  frontmatterRaw: string;
  body: string;
} {
  const trimmed = content.trim();

  if (!trimmed.startsWith(FRONTMATTER_DELIMITER)) {
    throw new Error("DOPS file must start with --- frontmatter delimiter");
  }

  // Find the closing --- on its own line (or at end of string)
  const closingPattern = /\n---\s*(?:\n|$)/;
  const remainder = trimmed.slice(FRONTMATTER_DELIMITER.length);
  const match = closingPattern.exec(remainder);

  if (!match) {
    throw new Error("DOPS file missing closing --- frontmatter delimiter");
  }

  const secondDelimiterIndex = FRONTMATTER_DELIMITER.length + match.index;
  const frontmatterRaw = trimmed.slice(FRONTMATTER_DELIMITER.length, secondDelimiterIndex).trim();
  const body = trimmed.slice(secondDelimiterIndex + match[0].length).trim();

  return { frontmatterRaw, body };
}

function parseMarkdownSections(body: string): MarkdownSections {
  const sectionMap = new Map<string, string>();
  const lines = body.split("\n");

  let currentSection: string | null = null;
  let currentContent: string[] = [];

  for (const line of lines) {
    const headingMatch = /^## (\S.*)$/.exec(line);
    if (headingMatch) {
      if (currentSection) {
        sectionMap.set(currentSection.toLowerCase(), currentContent.join("\n").trim());
      }
      currentSection = headingMatch[1].trim();
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  if (currentSection) {
    sectionMap.set(currentSection.toLowerCase(), currentContent.join("\n").trim());
  }

  return {
    prompt: sectionMap.get("prompt") ?? "",
    updatePrompt: sectionMap.get("update prompt"),
    examples: sectionMap.get("examples"),
    constraints: sectionMap.get("constraints"),
    keywords: sectionMap.get("keywords") ?? "",
  };
}
