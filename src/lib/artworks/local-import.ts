import "server-only";

import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { projects } from "../../data/projects";
import type { AdminImage, AdminProject } from "../../types/artwork";
import type { Database } from "../../types/database";
import { imageSrc } from "../image";
import { databaseError, getProject, projectSelect } from "./admin";
import { ArtworkError } from "./validation";

type Client = SupabaseClient<Database>;

function stableId(name: string) {
  const hex = createHash("sha256").update(`hux-local-artwork-import-v1:${name}`).digest("hex").split("");
  hex[12] = "5";
  hex[16] = ((parseInt(hex[16], 16) & 3) | 8).toString(16);
  const id = hex.join("").slice(0, 32);
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
}

const usedSlugs = new Set<string>();
export const localImport = projects.map((source, sort_order) => {
  let slug = source.slug;
  let suffix = 2;
  while (usedSlugs.has(slug)) slug = `${source.slug}-${suffix++}`;
  usedSlugs.add(slug);
  const id = stableId(slug);
  const fields = { slug, title: source.title, project_type: source.projectType, categories: source.categories, sort_order };
  const images = source.images.map((image, index) => {
    const imageId = stableId(`${slug}:image:${index}`);
    return {
      id: imageId, storage_path: `${id}/${imageId}.jpg`,
      alt_text: image.alt, width: image.width, height: image.height, sort_order: index,
      source: imageSrc(image.src),
    };
  });
  return { id, fields, images };
});

type Entry = (typeof localImport)[number];
const imageRecord = ({ source: _source, ...record }: Entry["images"][number]) => record;
const equal = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function sameFields(project: AdminProject, entry: Entry) {
  return Object.entries(entry.fields).every(([key, value]) => equal(project[key as keyof typeof entry.fields], value));
}

function sameImages(images: AdminImage[], entry: Entry) {
  const ordered = [...images].sort((a, b) => a.sort_order - b.sort_order);
  return ordered.length === entry.images.length && ordered.every((image, index) => {
    const expected = imageRecord(entry.images[index]);
    return Object.entries(expected).every(([key, value]) => image[key as keyof AdminImage] === value);
  });
}

export async function importStatus(supabase: Client) {
  const { data, error } = await supabase.from("projects").select(projectSelect).limit(1000);
  if (error) throw databaseError(error);
  const existing = data as AdminProject[];
  return localImport.map((entry, index) => {
    const project = existing.find((project) => project.id === entry.id);
    const slugCollision = existing.some((project) => project.slug === entry.fields.slug && project.id !== entry.id);
    const complete = !!project && sameFields(project, entry) && sameImages(project.project_images, entry);
    const conflict = slugCollision || (!!project && (!sameFields(project, entry) || (project.project_images.length > 0 && !complete)));
    return { index, id: entry.id, slug: entry.fields.slug, label: entry.fields.project_type, images: entry.images.length, complete, conflict };
  });
}

async function sourceBytes(source: string, origin: string) {
  if (!source.startsWith("/_next/static/media/") || !/\.jpg$/i.test(source)) {
    throw new ArtworkError(400, "The local import contains an unsupported source image.");
  }
  // Only trusted, compiled local asset URLs are fetched. No request-supplied URL
  // or cookies are forwarded to an external destination.
  const response = await fetch(new URL(source, origin), { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new ArtworkError(503, "A local artwork file could not be read. Keep the development server running and retry.");
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.length || bytes.length > 10 * 1024 * 1024 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    throw new ArtworkError(400, "A local artwork file is not a supported JPEG up to 10 MB.");
  }
  return bytes;
}

const digest = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");

async function verifyStored(supabase: Client, path: string, expected: Buffer) {
  const { data, error } = await supabase.storage.from("artworks").download(path);
  if (error || !data) throw new ArtworkError(503, "An uploaded image could not be verified. Retry the import; existing images will not be overwritten.");
  if (digest(Buffer.from(await data.arrayBuffer())) !== digest(expected)) {
    throw new ArtworkError(409, "An existing Storage image differs from the original. Import stopped without overwriting it.");
  }
}

export async function importOneProject(supabase: Client, index: number, origin: string) {
  const entry = localImport[index];
  if (!entry) throw new ArtworkError(400, "Invalid local project index.");
  const { data: existing, error: existingError } = await supabase.from("projects").select(projectSelect).eq("id", entry.id).maybeSingle();
  if (existingError) throw databaseError(existingError);
  let project = existing as AdminProject | null;
  if (project && (!sameFields(project, entry) || (project.project_images.length > 0 && !sameImages(project.project_images, entry)))) {
    throw new ArtworkError(409, "This import project was edited or contains different images. It has not been overwritten.");
  }
  if (!project) {
    const { data, error } = await supabase.from("projects")
      .insert({ id: entry.id, ...entry.fields, is_published: false }).select(projectSelect).single();
    if (error) throw databaseError(error);
    project = data as AdminProject;
  }

  const { data: stored, error: listError } = await supabase.storage.from("artworks").list(entry.id, { limit: 1000 });
  if (listError) throw new ArtworkError(503, "Storage could not be read. Check the artwork bucket policies and retry.");
  for (const image of entry.images) {
    const bytes = await sourceBytes(image.source, origin);
    const name = image.storage_path.split("/")[1];
    if (!stored.some((file) => file.name === name)) {
      const { error } = await supabase.storage.from("artworks").upload(image.storage_path, bytes, {
        contentType: "image/jpeg", upsert: false, cacheControl: "300",
      });
      if (error) throw new ArtworkError(503, "An image upload did not complete. Retry this project; uploaded originals are retained and will not be overwritten.");
    }
    await verifyStored(supabase, image.storage_path, bytes);
  }

  if (sameImages(project.project_images, entry)) return { project, alreadyImported: true };
  const { error } = await supabase.rpc("save_artwork_project", {
    p_id: entry.id, p_expected_updated_at: project.updated_at,
    p_project: { ...entry.fields, is_published: project.is_published },
    p_images: entry.images.map(imageRecord),
  });
  if (error) throw databaseError(error);
  project = await getProject(supabase, entry.id);
  if (!sameFields(project, entry) || !sameImages(project.project_images, entry)) {
    throw new ArtworkError(409, "Imported records differ from the local data. Review the project before continuing.");
  }
  return { project, alreadyImported: false };
}

export async function verifyLocalImport(supabase: Client, origin: string) {
  const status = await importStatus(supabase);
  if (!status.every((entry) => entry.complete && !entry.conflict)) throw new ArtworkError(409, "Complete all local projects before running the final verification.");
  let images = 0;
  for (const entry of localImport) {
    for (const image of entry.images) {
      await verifyStored(supabase, image.storage_path, await sourceBytes(image.source, origin));
      images++;
    }
  }
  return { projects: status.length, images, verified: true };
}

