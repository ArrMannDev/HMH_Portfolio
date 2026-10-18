type ProjectRow = {
  id: string;
  slug: string;
  title: string | null;
  project_type: string;
  categories: string[];
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

type ProjectImageRow = {
  id: string;
  project_id: string;
  storage_path: string;
  alt_text: string;
  width: number;
  height: number;
  sort_order: number;
  created_at: string;
};

// Matches the database schema created in the Supabase SQL Editor.
export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: { user_id: string; created_at: string };
        Insert: { user_id: string; created_at?: string };
        Update: { user_id?: string; created_at?: string };
        Relationships: [];
      };
      projects: {
        Row: ProjectRow;
        Insert: Pick<ProjectRow, "slug" | "project_type" | "categories"> &
          Partial<Omit<ProjectRow, "slug" | "project_type" | "categories">>;
        Update: Partial<ProjectRow>;
        Relationships: [];
      };
      project_images: {
        Row: ProjectImageRow;
        Insert: Pick<ProjectImageRow, "project_id" | "storage_path" | "alt_text" | "width" | "height"> &
          Partial<Pick<ProjectImageRow, "id" | "sort_order" | "created_at">>;
        Update: Partial<ProjectImageRow>;
        Relationships: [{
          foreignKeyName: "project_images_project_id_fkey";
          columns: ["project_id"];
          isOneToOne: false;
          referencedRelation: "projects";
          referencedColumns: ["id"];
        }];
      };
    };
    Views: Record<string, never>;
    Functions: {
      save_artwork_project: {
        Args: { p_id: string; p_expected_updated_at: string; p_project: unknown; p_images: unknown };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
