import api, { setAccessToken } from "./api.js";

export async function login(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  setAccessToken(data.accessToken);
  return data;
}

export async function logout() {
  await api.post("/auth/logout");
  setAccessToken(null);
}

export async function forgotPassword(email) {
  return api.post("/auth/forgot-password", { email });
}

export async function resetPassword(token, password) {
  return api.post("/auth/reset-password", { token, password });
}
