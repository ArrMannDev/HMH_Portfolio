import type { ImageSource } from "../lib/image";

export const categoryLabels = {
  advertising: "Advertising",
  branding: "Branding",
  campaign: "Campaign",
  posters: "Posters",
  "social-media": "Social Media",
  illustration: "Illustration",
} as const;

export type ProjectCategory = keyof typeof categoryLabels;
export type ProjectLayout = "featured" | "portrait" | "square" | "landscape";
export type ProjectImage = {
  src: ImageSource;
  alt: string;
  width: number;
  height: number;
  aspectRatio: "portrait" | "square" | "landscape";
};
export type Project = {
  id: string;
  slug: string;
  title: string | null;
  projectType: string;
  categories: ProjectCategory[];
  images: ProjectImage[];
  featured: boolean;
  layout: ProjectLayout;
};

export type AdminImage = {
  id: string;
  storage_path: string;
  alt_text: string;
  width: number;
  height: number;
  sort_order: number;
};
export type AdminProject = {
  id: string;
  slug: string;
  title: string | null;
  project_type: string;
  categories: ProjectCategory[];
  sort_order: number;
  is_published: boolean;
  updated_at: string;
  project_images: AdminImage[];
};

export const MAX_IMAGES = 24;
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const uploadTypes = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as const;
