import { API } from "../utils/api";
import { type SingleResponse } from "../utils/types";
import { request } from "./base-api";

export interface CreateReportRequestParams {
  url: string;
  content: string;
  isPersonal: boolean;
  isMedia: boolean;
  desciption: string;
  photoId: string;
}

export interface Report {
  id: string;
  url: string;
  createdAt: string;
  content: string;
  isPersonal: string;
  desciption: string;
  author: {
    name: string;
  };
  photo: {
    url: string;
  };
}

export const createReport = async (
  params: CreateReportRequestParams,
  tg_id: number
): Promise<SingleResponse<Report>> => {
  const { data } = await request<SingleResponse<Report>>(
    {
      url: `${API.report}/create`,
      method: "POST",
      data: params,
    },
    tg_id
  );

  return data;
};
