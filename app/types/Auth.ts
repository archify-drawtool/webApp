export interface User {
  id: number;
  name: string;
  email: string;
  show_background_dots: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}
