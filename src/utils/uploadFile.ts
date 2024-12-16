import axios from "axios";

export const uploadFile = async (path: string, file: File): Promise<Response> =>
  await axios.put(path, file, {
    headers: {
      "Content-Type": file.type,
    },
  });
