import { type SingleResponse } from "../utils/types";
import { type Profile } from "./profiles";
import { request } from "./base-api";
import { API } from "../utils/api";

export interface SignInRequestParams {
  login: string;
  password: string;
}

export interface LoginResponseParams {
  profile: Profile;
  accessToken: string;
  expiresAt: number;
}

export const signIn = async (
  params: SignInRequestParams, tg_id: number
): Promise<SingleResponse<LoginResponseParams>> => {
  const { data } = await request<SingleResponse<LoginResponseParams>>({
    url: `${API.identity}/sign-in`,
    method: "POST",
    data: params
  }, tg_id);

  return data;
};