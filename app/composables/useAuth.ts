import type { User, LoginResponse } from "~/types/Auth";
import type { PublicClientApplication, Configuration, AuthenticationResult } from "@azure/msal-browser";

let msalInstance: PublicClientApplication | null = null;
let msalInstancePromise: Promise<PublicClientApplication> | null = null;

export const useAuth = () => {
  const { post, get } = useApi();
  const config = useRuntimeConfig();

  const token = useCookie<string | null>("auth_token");
  const user = useState<User | null>("auth_user", () => null);
  const isLoggedIn = computed(() => !!token.value);

  const getMsalInstance = async (): Promise<PublicClientApplication> => {
    if (!import.meta.client) {
      throw new Error("MSAL is browser-only");
    }
    if (msalInstance) return msalInstance;
    // Cache the in-flight init so concurrent callers (warm-up + a fast click)
    // share one instance instead of each creating + initializing their own.
    if (!msalInstancePromise) {
      msalInstancePromise = (async () => {
        const { PublicClientApplication } = await import("@azure/msal-browser");
        const msalConfig: Configuration = {
          auth: {
            clientId: config.public.entraClientId as string,
            authority: `https://login.microsoftonline.com/${config.public.entraTenantId}`,
            redirectUri: `${window.location.origin}/auth/callback.html`,
          },
          cache: { cacheLocation: "sessionStorage" },
        };
        const instance = new PublicClientApplication(msalConfig);
        await instance.initialize();
        msalInstance = instance;
        return instance;
      })().catch((err) => {
        msalInstancePromise = null; // allow retry on next call
        throw err;
      });
    }
    return msalInstancePromise;
  };

  const loginWithMicrosoft = async (): Promise<void> => {
    const msal = await getMsalInstance();

    const result: AuthenticationResult = await msal.loginPopup({
      scopes: ["openid", "profile", "email"],
      redirectUri: `${window.location.origin}/auth/callback.html`,
    });

    const response = await post<LoginResponse>(
      "/api/auth/microsoft",
      { id_token: result.idToken },
    );

    if (response) {
      token.value = response.token;
      user.value = response.user;
      await navigateTo("/projecten");
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await post("/api/logout", {});
    } finally {
      token.value = null;
      user.value = null;
      if (msalInstance) {
        await msalInstance.clearCache();
        msalInstance = null;
        msalInstancePromise = null;
      }
      await navigateTo("/login");
    }
  };

  const fetchCurrentUser = async (): Promise<void> => {
    try {
      const response = await get<User>("/api/me");
      if (response) user.value = response;
    } catch {
      token.value = null;
      user.value = null;
    }
  };

  const initMsal = async (): Promise<void> => {
    if (!import.meta.client) return;
    try {
      await getMsalInstance();
    } catch {
      // Best-effort warm-up; loginWithMicrosoft will retry/surface errors.
    }
  };

  return { loginWithMicrosoft, logout, fetchCurrentUser, initMsal, user, token, isLoggedIn };
};
