import { type SingleResponse } from "../utils/types";
import { request } from "./base-api";
import { API } from "../utils/api";

export interface Profile {
  id: string;
  createdAt: string;
  isVerify: boolean;
  role: string;
  name: string;
  parent: Squad;
  permissions: string[];
  tag: string;
  experience: number;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface Squad {
  id: string;
  name: string;
}

export const getMyProfile = async (
  signal: AbortSignal | undefined, tg_id: number
): Promise<SingleResponse<Profile>> => {
  const { data } = await request<SingleResponse<Profile>>({
    url: `${API.profiles}/me`,
    signal,
    tg_id
  });

  return data;
};