import type { User, LoginCredentials, LoginResponse } from "~/types/Auth";

export const useAuth = () => {
  const { post } = useApi();

  const token = useCookie<string | null>("auth_token");
  const user = useState<User | null>("auth_user", () => null);
  const isLoggedIn = computed(() => !!token.value);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    const response = await post<LoginResponse>(
      "/api/login",
        credentials as unknown as Record<string, unknown>,
    );
    if (response) {
      token.value = response.token;
      user.value = response.user;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await post("/api/logout", {});
    } finally {
      token.value = null;
      user.value = null;
    }
  };

  return { login, logout, user, token, isLoggedIn };
};
