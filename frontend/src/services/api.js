import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

let accessToken = localStorage.getItem("ticketdesk_token") || null;

export function setAccessToken(token) {
  accessToken = token;
  if (token) localStorage.setItem("ticketdesk_token", token);
  else localStorage.removeItem("ticketdesk_token");
}

export function getAccessToken() {
  return accessToken;
}

api.interceptors.request.use((config) => {
  const t = accessToken || localStorage.getItem("ticketdesk_token");
  if (t) {
    config.headers.Authorization = `Bearer ${t}`;
  }
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  } else {
    delete config.headers["Content-Type"];
  }
  return config;
});

let refreshing = null;

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }
    if (original.url?.includes("/auth/refresh") || original.url?.includes("/auth/login")) {
      return Promise.reject(error);
    }
    original._retry = true;
    try {
      if (!refreshing) {
        refreshing = api.post("/auth/refresh").then((res) => {
          setAccessToken(res.data.accessToken);
          refreshing = null;
        });
      }
      await refreshing;
      return api(original);
    } catch {
      refreshing = null;
      setAccessToken(null);
      return Promise.reject(error);
    }
  }
);

export default api;
