import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

function assertWithinUploads(resolvedPath: string): void {
  const normalizedUploads = path.resolve(UPLOADS_DIR);
  const normalizedTarget = path.resolve(resolvedPath);
  if (
    !normalizedTarget.startsWith(normalizedUploads + path.sep) &&
    normalizedTarget !== normalizedUploads
  ) {
    throw new Error("Path traversal blocked");
  }
}

export async function saveDopsFile(
  slug: string,
  version: string,
  content: Buffer,
): Promise<string> {
  const dir = path.join(UPLOADS_DIR, slug);
  assertWithinUploads(dir);

  const filePath = path.join(dir, `${version}.dops`);
  assertWithinUploads(filePath);

  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  await writeFile(filePath, content);

  return `uploads/${slug}/${version}.dops`;
}

export async function readDopsFile(slug: string, version: string): Promise<Buffer> {
  const filePath = path.join(UPLOADS_DIR, slug, `${version}.dops`);
  assertWithinUploads(filePath);
  return readFile(filePath);
}

export function getDopsFilePath(slug: string, version: string): string {
  const filePath = path.join(UPLOADS_DIR, slug, `${version}.dops`);
  assertWithinUploads(filePath);
  return filePath;
}
