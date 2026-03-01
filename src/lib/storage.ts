import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

export async function saveDopsFile(
  slug: string,
  version: string,
  content: Buffer,
): Promise<string> {
  const dir = path.join(UPLOADS_DIR, slug);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  const filePath = path.join(dir, `${version}.dops`);
  await writeFile(filePath, content);

  return `uploads/${slug}/${version}.dops`;
}

export async function readDopsFile(slug: string, version: string): Promise<Buffer> {
  const filePath = path.join(UPLOADS_DIR, slug, `${version}.dops`);
  return readFile(filePath);
}

export function getDopsFilePath(slug: string, version: string): string {
  return path.join(UPLOADS_DIR, slug, `${version}.dops`);
}
