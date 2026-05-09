export const TOKEN_KEY = "token";
export const USER_KEY = "user";

/* =========================
   AUTH CHECK
========================= */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(TOKEN_KEY);
};

/* =========================
   GET USER (FIXED SAFE ID)
========================= */
export const getUser = (): { _id: string; name?: string; email?: string } | null => {
  const user = localStorage.getItem(USER_KEY);

  if (!user) return null;

  try {
    const parsed = JSON.parse(user);

    return {
      ...parsed,
      _id: parsed._id || parsed.id,
    };
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

  // normalize user BEFORE saving
  const safeUser = {
    ...user,
    _id: user._id || user.id,
  };

  localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
};
