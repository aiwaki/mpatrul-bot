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

export const getLinkStats = async (
  period: "all" | "day" | "week" | "month"
): Promise<{ count: number }> => {
  try {
    let query = supabase.from("links").select("id", { count: "exact" });

    switch (period) {
      case "day":
        query = query.gte(
          "created_at",
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        );
        break;
      case "week":
        query = query.gte(
          "created_at",
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        );
        break;
      case "month":
        query = query.gte(
          "created_at",
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        );
        break;
    }

    const { count, error } = await query;
    if (error) {
      handleError("Error fetching link statistics:", error);
      return { count: 0 };
    }
    return { count: count || 0 };
  } catch (error) {
    console.error("Unexpected error in getLinkStats:", error);
    return { count: 0 };
  }
};
