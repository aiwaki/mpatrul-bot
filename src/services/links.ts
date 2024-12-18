import { API } from "../utils/api";
import { type SingleResponse } from "../utils/types";
import { type Report } from "./reports";
import { request } from "./base-api";

export interface CreateLinkRequestParams {
  url: string;
}

export interface CreateLinkResponse {
  link: any;
  count: number;
  updatedAt: string;
  report: Report;
}

export const createLink = async (
  params: CreateLinkRequestParams, tg_id: number
): Promise<SingleResponse<CreateLinkResponse>> => {
  const { data } = await request<SingleResponse<CreateLinkResponse>>({
    url: `${API.link}/create`,
    method: "POST",
    data: params
  }, tg_id);

  return data;
};
