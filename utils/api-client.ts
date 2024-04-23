type QueryParamValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | boolean[];
type QueryParams = Record<string, QueryParamValue>;

interface CommonFetchOptions {
  headers?: HeadersInit;
  next?: NextFetchRequestConfig;
  cache?: RequestCache;
}

interface GetFetchOptions extends CommonFetchOptions {
  params?: QueryParams;
}

interface BodyFetchOptions extends CommonFetchOptions {
  body?: any;
  params?: QueryParams;
}

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "HttpError";
  }
}

async function fetchData<T>(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  options: GetFetchOptions | BodyFetchOptions
): Promise<T> {
  const requestOptions: RequestInit = {
    method,
    next: options.next,
    cache: options.cache,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  if (
    (method === "POST" || method === "PUT" || method === "DELETE") &&
    "body" in options
  ) {
    requestOptions.body =
      typeof options.body === "string"
        ? options.body
        : JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, requestOptions);
    if (!response.ok) {
      const { message } = await response.json();
      throw new HttpError(
        response.status,
        message || `HTTP error! status: ${response.status}`
      );
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error("Fetch Error:", error);
    throw error;
  }
}

function serializeQueryParams(params: QueryParams): string {
  const queryEntries = Object.entries(params).flatMap(([key, value]) => {
    if (Array.isArray(value)) {
      return value.map((val) => [`${key}[]`, val.toString()]);
    }
    if (value === undefined || value === null) {
      return [];
    }
    return [[key, value.toString()]];
  });

  return new URLSearchParams(queryEntries as [string, string][]).toString();
}

export function get<T = any>(
  url: string,
  options: GetFetchOptions = {}
): Promise<T> {
  const urlWithParams = options.params
    ? `${url}?${serializeQueryParams(options.params)}`
    : url;
  return fetchData<T>(urlWithParams, "GET", options);
}

export function post<T = any>(
  url: string,
  options: BodyFetchOptions = {}
): Promise<T> {
  const urlWithParams = options.params
    ? `${url}?${serializeQueryParams(options.params)}`
    : url;

  return fetchData<T>(urlWithParams, "POST", options);
}

export function put<T = any>(
  url: string,
  options: BodyFetchOptions = {}
): Promise<T> {
  return fetchData<T>(url, "PUT", options);
}

export function del<T = any>(
  url: string,
  options: BodyFetchOptions = {}
): Promise<T> {
  const urlWithParams = options.params
    ? `${url}?${serializeQueryParams(options.params)}`
    : url;
  return fetchData<T>(urlWithParams, "DELETE", options);
}
