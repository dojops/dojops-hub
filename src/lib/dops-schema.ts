import { z } from "zod";

// Permissions
export const PermissionsSchema = z.object({
  filesystem: z.enum(["read", "write"]).default("write"),
  child_process: z.enum(["required", "none"]).default("none"),
  network: z.enum(["none", "required"]).default("none"),
});

// Meta
export const MetaSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z][a-z0-9-]*$/),
  version: z.string().min(1),
  description: z.string().min(1).max(500),
  author: z.string().optional(),
  license: z.string().optional(),
  tags: z.array(z.string()).optional(),
  repository: z.string().optional(),
  icon: z
    .string()
    .url()
    .max(2048)
    .refine((url) => url.startsWith("https://"), { message: "Icon URL must use HTTPS" })
    .optional(),
});

// Risk
export const RiskSchema = z.object({
  level: z.enum(["LOW", "MEDIUM", "HIGH"]),
  rationale: z.string().min(1).max(500),
});

// Scope
export const ScopeSchema = z.object({
  write: z.array(z.string().min(1)).min(1),
});

// Execution
export const ExecutionSchema = z.object({
  mode: z.enum(["generate", "update"]).default("generate"),
  deterministic: z.boolean().default(false),
  idempotent: z.boolean().default(false),
});

// Verification
export const VerificationConfigSchema = z.object({
  structural: z
    .array(
      z.object({
        path: z.string(),
        required: z.boolean().optional(),
        type: z.string().optional(),
        minItems: z.number().int().optional(),
        message: z.string(),
        requiredUnless: z.string().optional(),
      }),
    )
    .optional(),
  binary: z
    .object({
      command: z.string().min(1),
      parser: z.string().min(1),
      timeout: z.number().int().positive().default(30000),
      cwd: z.enum(["output", "tool"]).default("output"),
    })
    .optional(),
  severity: z
    .object({
      error: z.array(z.string()).optional(),
      warning: z.array(z.string()).optional(),
      info: z.array(z.string()).optional(),
    })
    .optional(),
});

// Detection
export const DetectionConfigSchema = z.object({
  paths: z.array(z.string()).min(1),
  updateMode: z.boolean().default(true),
});

// Update
export const UpdateSchema = z.object({
  strategy: z.enum(["replace", "preserve_structure"]).default("replace"),
  inputSource: z.enum(["file"]).default("file"),
  injectAs: z.string().default("existingContent"),
});

// Capabilities
export const CapabilitiesSchema = z.object({
  sideEffects: z.enum(["none", "filesystem", "network", "process"]).default("filesystem"),
  runtime: z.enum(["short", "long"]).default("short"),
});

// Context7 library reference
export const Context7LibraryRefSchema = z.object({
  name: z.string().min(1),
  query: z.string().min(1),
});

// Context block (v2)
export const ContextBlockSchema = z.object({
  technology: z.string().min(1),
  fileFormat: z.enum(["yaml", "hcl", "json", "raw", "ini", "toml"]),
  outputGuidance: z.string().min(1),
  bestPractices: z.array(z.string().min(1)).min(1),
  context7Libraries: z.array(Context7LibraryRefSchema).optional(),
});

// File spec (v2 — raw format only)
export const FileSpecSchema = z.object({
  path: z.string().min(1),
  format: z.literal("raw").default("raw"),
  conditional: z.boolean().optional(),
});

// Full frontmatter (v2 only)
export const DopsFrontmatterSchema = z.object({
  dops: z.literal("v2"),
  kind: z.enum(["tool"]).default("tool"),
  meta: MetaSchema,
  context: ContextBlockSchema,
  files: z.array(FileSpecSchema).min(1),
  detection: DetectionConfigSchema.optional(),
  verification: VerificationConfigSchema.optional(),
  permissions: PermissionsSchema.optional(),
  scope: ScopeSchema.optional(),
  risk: RiskSchema.optional(),
  execution: ExecutionSchema.optional(),
  update: UpdateSchema.optional(),
  capabilities: CapabilitiesSchema.optional(),
});

export type DopsFrontmatter = z.infer<typeof DopsFrontmatterSchema>;

// Markdown sections
export interface MarkdownSections {
  prompt: string;
  updatePrompt?: string;
  examples?: string;
  constraints?: string;
  keywords: string;
}

// Complete skill
export interface DopsSkill {
  frontmatter: DopsFrontmatter;
  sections: MarkdownSections;
  raw: string;
}
