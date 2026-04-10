export const useApi = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBaseUrl;
  const token = useCookie<string | null>('auth_token');
  const authHeader = computed((): Record<string, string> =>
    token.value ? { Authorization: `Bearer ${token.value}` } : {}
  );

  const handleError = (error: unknown): never => {
    const err = error as {
      status?: number;
      data?: { message?: string };
      message?: string;
    };

    const message =
      err?.data?.message ||
      err?.message ||
      "Er is een onbekende fout opgetreden";

    throw createError({
      statusCode: err?.status || 500,
      statusMessage: message,
    });
  };

  const get = async <T>(endpoint: string, options = {}) => {
    try {
      return await $fetch<T>(`${baseURL}${endpoint}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...authHeader.value,
        },
        ...options,
      });
    } catch (error) {
      handleError(error);
    }
  };

  const post = async <T>(
    endpoint: string,
    body: Record<string, unknown> = {},
    headers: Record<string, string> = {},
  ) => {
    try {
      return await $fetch<T>(`${baseURL}${endpoint}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...authHeader.value,
          ...headers,
        },
        body,
      });
    } catch (error) {
      handleError(error);
    }
  };

  const put = async <T>(
    endpoint: string,
    body: Record<string, unknown> = {},
    headers: Record<string, string> = {},
  ) => {
    try {
      return await $fetch<T>(`${baseURL}${endpoint}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...authHeader.value,
          ...headers,
        },
        body,
      });
    } catch (error) {
      handleError(error);
    }
  };

  return { get, post, put };
};
