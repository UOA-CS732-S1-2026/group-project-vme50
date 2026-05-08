export const TOKEN_KEY = "token";
export const USER_KEY = "user";

/* =========================
   AUTH CHECK
========================= */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(TOKEN_KEY);
};

/* =========================
   GET USER
========================= */
export const getUser = (): { name?: string; email?: string } | null => {
  const user = localStorage.getItem(USER_KEY);

  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};

/* =========================
   CLEAR AUTH (LOGOUT)
========================= */
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/* =========================
   SET AUTH (LOGIN)
========================= */
export const setAuth = (token: string, user: any) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};
