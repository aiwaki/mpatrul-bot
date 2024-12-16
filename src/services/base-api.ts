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

const useToken = (requestConfig: any): any => {
  const { tg_id } = requestConfig;
  if (!tg_id) {
    throw new Error("tg_id is required in requestConfig");
  }

  return {
    ...requestConfig,
    headers: {
      Authorization: `Bearer ${fetchToken(tg_id)}`,
      accept: "application/json",
      ...requestConfig?.headers,
    },
  };
}; // TODO: Fix

publicAxios.interceptors.request.use(useToken);

export const request = async <ResD, ReqD = unknown>(
  config: RequestConfig<ReqD> & { tg_id: number }
): Promise<AxiosResponse<ResD>> => {
  const {
    url,
    method = "GET",
    headers = {},
    data = {},
    params = {},
    tg_id, // Получаем tg_id
    ...options
  } = config;

  const response = await publicAxios.request({
    url,
    method,
    headers,
    data,
    params,
    ...options,
  });

  return response;
};
