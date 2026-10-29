//Axios
import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("kurio:session");
    if (raw) {
      const session = JSON.parse(raw) as { token?: string };
      if (session.token)
        config.headers.Authorization = `Bearer ${session.token}`;
    }
  } catch {
    /* Error */
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      const hasSession = Boolean(localStorage.getItem("kurio:session"));
      if (hasSession) {
        localStorage.removeItem("kurio:session");
        window.dispatchEvent(new Event("kurio:session-expired"));
      }
    }
    return Promise.reject(error);
  },
);
