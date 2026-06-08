import type { User, LoginResponse } from "~/types/Auth";
import type { PublicClientApplication, Configuration, AuthenticationResult } from "@azure/msal-browser";

let msalInstance: PublicClientApplication | null = null;

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
    if (!msalInstance) {
      const { PublicClientApplication } = await import("@azure/msal-browser");
      const msalConfig: Configuration = {
        auth: {
          clientId: config.public.entraClientId as string,
          authority: `https://login.microsoftonline.com/${config.public.entraTenantId}`,
          redirectUri: `${window.location.origin}/auth/callback.html`,
        },
        cache: { cacheLocation: "sessionStorage" },
      };
      msalInstance = new PublicClientApplication(msalConfig);
      await msalInstance.initialize();
    }
    return msalInstance;
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

  return { loginWithMicrosoft, logout, fetchCurrentUser, user, token, isLoggedIn };
};
