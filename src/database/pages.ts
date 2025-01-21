import { supabase, handleError, fetchData } from "./client";

export enum PageState {
  Unknown = "unknown",
  Reported = "reported",
  Hidden = "hidden",
}

export interface Classification {
  label: string;
  content: string;
  score: number;
}

export interface Page {
  title: string;
  description: string;
  url: string;
  classify_out_id: number;
  state?: string;
}

export const insertClassification = async (
  classification: Classification
): Promise<number> => {
  const { data, error } = await supabase
    .from("classifications")
    .insert([classification])
    .select("id")
    .single();

  if (error) {
    handleError("Error inserting classification:", error);
  }

  return data?.id;
};

export const insertClassificationsBatch = async (
  classifications: Classification[]
): Promise<number[]> => {
  const { data, error } = await supabase
    .from("classifications")
    .insert(classifications)
    .select("id");

  if (error) {
    handleError("Error batch inserting classifications:", error);
  }

  return data?.map((item) => item.id) ?? [];
};

export const insertPage = async (page: Page): Promise<void> => {
  const { error } = await supabase.from("pages").insert([page]);

  if (error) {
    handleError("Error inserting page:", error);
  }
};

export const insertPagesBatch = async (pages: Page[]): Promise<number[]> => {
  const { data, error } = await supabase
    .from("pages")
    .insert(pages)
    .select("id");

  if (error) {
    handleError("Error batch inserting pages:", error);
  }

  return data?.map((item) => item.id) ?? [];
};

export const fetchPages = async (): Promise<Page[]> => {
  const { data, error } = await supabase
    .from("pages")
    .select()
    .eq("state", PageState.Unknown);

  if (error) {
    handleError("Error fetching pages:", error);
  }

  return (data as Page[]) ?? [];
};

export const updatePageState = async (
  url: string,
  state: PageState
): Promise<void> => {
  const { error } = await supabase
    .from("pages")
    .update({ state })
    .eq("url", url);

  if (error) {
    handleError("Error updating page state:", error);
  }
};

export const fetchClassificationsByLabel = async (
  label: string
): Promise<Classification[]> => {
  return (await fetchData("classifications", { label })) as Classification[];
};

export const fetchPagesByKeyword = async (keyword: string): Promise<Page[]> => {
  const { data, error } = await supabase
    .from("pages")
    .select()
    .or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`);

  if (error) {
    handleError("Error fetching pages by keyword:", error);
  }

  return (data as Page[]) ?? [];
};

export const isPageExist = async (url: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from("pages")
    .select("id")
    .eq("url", url)
    .single();

  if (error && error.code !== "PGRST116") {
    handleError("Error checking if page exists:", error);
  }

  return data !== null;
};

export const fetchClassification = async (
  id: number
): Promise<Classification> => {
  const { data, error } = await supabase
    .from("classifications")
    .select()
    .eq("id", id)
    .single();

  if (error) {
    handleError("Error fetching classification:", error);
  }

  return data as Classification;
};
