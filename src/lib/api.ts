export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.qipa.co"
).replace(/\/$/, "");

export interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

let activeToken: string | undefined;

export function setActiveToken(token?: string) {
  activeToken = token;
}

export function getActiveToken() {
  return activeToken;
}

export async function apiRequest<T>(
  path: string,
  options: Omit<RequestInit, "body"> & { token?: string; body?: unknown } = {},
): Promise<T> {
  const { token, headers, body: jsonBody, ...rest } = options;
  const authToken = token ?? getActiveToken();
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...rest,
      body: jsonBody !== undefined ? JSON.stringify(jsonBody) : undefined,
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...headers,
      },
    });
  } catch {
    throw new ApiRequestError(
      "Cannot reach the server. Check your connection and try again.",
      0,
      "NETWORK_ERROR",
    );
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = body as ApiError;
    throw new ApiRequestError(err.error ?? "Request failed", response.status, err.code);
  }
  return body as T;
}

export function mediaUrl(url: string) {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  return `${API_URL}${url.startsWith("/") ? url : `/${url}`}`;
}
