import { AxiosError } from "axios";
import { ROUTE_SIGN_IN } from "./routes";

export type RequestError = APIValidationError[];

export interface APIValidationError {
  code: string;
}

const errorMessage = {
  network: "Пожалуйста, проверьте ваше подключение к Интернету",
  somethingError: "Что-то пошло не так. Пожалуйста, попробуйте снова",
};

export const handleRequestErrors = (errors: AxiosError<RequestError>): void => {
  const status = errors?.response?.status;
  const message = errors?.message ?? "";

  if (status === 401) {
    document.location.href = ROUTE_SIGN_IN;
    return;
  }

  if (message === "Network Error" && !status) {
    errors.response = {
      config: {} as any,
      headers: {},
      status: 0,
      statusText: "",
      data: [{ code: "Network_error" }],
    };
  }
};

export const handleFieldError = (
  error: unknown,
  messages: Record<string, string>,
  fields?: Record<string, string[]>
): any => {
  const axiosError = error as AxiosError;

  const apiErrors = axiosError?.response?.data as APIValidationError[];

  const apiVerifiedErrors = Array.isArray(apiErrors) ? apiErrors : [];

  const errorsArray = (
    apiVerifiedErrors?.length
      ? apiVerifiedErrors
      : [{ code: "something_error" }]
  ).map(({ code }) => ({ code: code.toLowerCase() }));

  const fieldsErrors: Record<string, string> = {
    ...messages,
    network_error: errorMessage.network,
    something_error: errorMessage.somethingError,
  };

  const objectErrors = Object.fromEntries(
    Object.entries(fields ?? {}).map(([key, values]) => [
      key,
      errorsArray?.find(({ code }) => values.includes(code))
        ? fieldsErrors?.[
        errorsArray?.find(({ code }) => values.includes(code))!.code
        ]
        : undefined,
    ])
  );

  if (Object.values(objectErrors).filter(Boolean)?.length) {
    return objectErrors;
  }
};
