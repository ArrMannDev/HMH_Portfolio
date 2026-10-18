import { categoryLabels, MAX_IMAGES, MAX_FILE_BYTES, uploadTypes, type ProjectCategory, type AdminImage } from "../../types/artwork";

export class ArtworkError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function uuid(value: unknown): string {
  if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    throw new ArtworkError(400, "Invalid project or image ID.");
  }
  return value.toLowerCase();
}

export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ArtworkError(400, "Expected a JSON object.");
  return value as Record<string, unknown>;
}

function text(value: unknown, label: string, max: number) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) {
    throw new ArtworkError(400, `${label} must contain 1 to ${max} characters.`);
  }
  return value.trim();
}

function integer(value: unknown, label: string, min: number, max: number) {
  if (!Number.isInteger(value) || (value as number) < min || (value as number) > max) {
    throw new ArtworkError(400, `${label} must be a whole number between ${min} and ${max}.`);
  }
  return value as number;
}

export function version(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(value) || Number.isNaN(Date.parse(value))) {
    throw new ArtworkError(400, "The project version is missing. Reload the project and try again.");
  }
  return value;
}

export function projectFields(value: unknown) {
  const input = record(value);
  const slug = text(input.slug, "Slug", 160);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) throw new ArtworkError(400, "Use lowercase letters, numbers, and single hyphens in the slug.");
  if (!Array.isArray(input.categories) || !input.categories.length || input.categories.length > 6 ||
    input.categories.some((category) => typeof category !== "string" || !Object.hasOwn(categoryLabels, category))) {
    throw new ArtworkError(400, "Choose at least one valid category.");
  }
  if (typeof input.is_published !== "boolean") throw new ArtworkError(400, "Choose draft or published.");
  return {
    title: input.title === null || input.title === "" ? null : text(input.title, "Title", 160),
    slug,
    project_type: text(input.project_type, "Project type", 120),
    categories: [...new Set(input.categories)] as ProjectCategory[],
    sort_order: integer(input.sort_order, "Display order", 0, 1000000),
    is_published: input.is_published,
  };
}

export function imageFields(value: unknown, projectId: string): AdminImage[] {
  if (!Array.isArray(value) || value.length > MAX_IMAGES) throw new ArtworkError(400, `Use no more than ${MAX_IMAGES} images per project.`);
  const images = value.map((entry, index) => {
    const image = record(entry);
    const path = text(image.storage_path, "Image path", 200);
    if (!new RegExp(`^${projectId}/[A-Za-z0-9_-]+[.](jpg|jpeg|png|webp)$`).test(path)) {
      throw new ArtworkError(400, "An image does not belong to this project.");
    }
    return {
      id: uuid(image.id), storage_path: path,
      alt_text: text(image.alt_text, `Image ${index + 1} description`, 500),
      width: integer(image.width, "Image width", 1, 30000),
      height: integer(image.height, "Image height", 1, 30000),
      sort_order: index,
    };
  });
  if (new Set(images.map((i) => i.id)).size !== images.length || new Set(images.map((i) => i.storage_path)).size !== images.length) {
    throw new ArtworkError(400, "Each image must appear only once in a project.");
  }
  return images;
}

export function uploadFields(value: unknown) {
  const input = record(value);
  if (typeof input.contentType !== "string" || !Object.hasOwn(uploadTypes, input.contentType)) {
    throw new ArtworkError(400, "Choose a JPEG, PNG, or WebP image.");
  }
  integer(input.size, "File size", 1, MAX_FILE_BYTES);
  return { extension: uploadTypes[input.contentType as keyof typeof uploadTypes] };
}
