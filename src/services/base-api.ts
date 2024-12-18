import axios, {
  type AxiosRequestConfig,
  type AxiosRequestHeaders,
  type AxiosResponse,
} from "axios";
import { BASE_URL } from "../utils/constants";
import { fetchToken } from "../database/api";

const publicAxios = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
});

type RequestHeaders = Omit<AxiosRequestHeaders, "Authorization"> & {
  Authorization?: `Bearer ${string}`;
};

type RequestParams =
  | Record<string, string | string[] | number | boolean | null | undefined>
  | URLSearchParams;

interface RequestConfig<D>
  extends Omit<AxiosRequestConfig<D>, "headers" | "params"> {
  headers?: RequestHeaders;
  params?: RequestParams;
}

export const request = async <ResD, ReqD = unknown>(
  config: RequestConfig<ReqD>,
  tg_id: number
): Promise<AxiosResponse<ResD>> => {
  const {
    url,
    method = "GET",
    headers = {},
    data = {},
    params = {},
    ...options
  } = config;

  const token = await fetchToken(tg_id);

  const updatedHeaders = {
    ...headers,
    Authorization: `Bearer ${token}`,
    accept: "application/json",
  } as Record<string, string>;

  const response = await publicAxios.request({
    url,
    method,
    headers: updatedHeaders,
    data,
    params,
    ...options,
  });

  return response;
};
