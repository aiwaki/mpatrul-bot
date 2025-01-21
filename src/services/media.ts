import { API } from "../utils/api";
import { type SingleResponse } from "../utils/types";
import { request } from "./base-api";

export enum Media {
  PNG = "image/png",
  JPG = "image/jpeg",
}

export interface CreateMediaRequestParams {
  format: Media;
}

export interface CreateMediaResponse {
  id: string;
  upload: string;
  fileUrl: string;
}

export const createMedia = async (
  params: CreateMediaRequestParams,
  tg_id: number
): Promise<SingleResponse<CreateMediaResponse>> => {
  const { data } = await request<SingleResponse<CreateMediaResponse>>(
    {
      url: `${API.media}/upload`,
      method: "POST",
      data: params,
    },
    tg_id
  );

  return data;
};
