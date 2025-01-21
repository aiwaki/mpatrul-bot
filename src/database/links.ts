import { supabase, handleError, fetchData } from "./client";

export const batchInsertLinks = async (
  tg_id: number,
  urls: string[]
): Promise<void> => {
  try {
    const insertData = urls.map((url) => ({ url, inserted_by: tg_id }));
    const { error } = await supabase.from("links").insert(insertData);
    if (error) {
      handleError("Error batch inserting links:", error);
    }
    console.log(`Inserted ${urls.length} links for chat ${tg_id}.`);
  } catch (error) {
    console.error("Unexpected error in batchInsertLinks:", error);
  }
};

export const fetchLinks = async (): Promise<any[]> => {
  return fetchData("links");
};

export const insertLink = async (tg_id: number, url: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("links")
      .insert({ url, inserted_by: tg_id });
    if (error) {
      handleError("Error inserting link:", error);
    }
    console.log(`Inserted link for chat ${tg_id}.`);
  } catch (error) {
    console.error("Unexpected error in insertLinks:", error);
  }
};
