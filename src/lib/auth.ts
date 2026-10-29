//API
import { api } from "./api";

//Axios
import axios from "axios";

//Types
import { type KurioUser } from "../types/KurioUser";

const SESSION_KEY = "kurio:session";

export async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export function getCurrentUser(): KurioUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as
      | { user?: KurioUser; token?: string; expiresAt?: number }
      | KurioUser;
    if ("user" in session && session.user) {
      if (
        !session.token ||
        (session.expiresAt && session.expiresAt < Date.now())
      ) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return session.user;
    }
    // Sessions created by older versions had no API token; require re-authentication.
    localStorage.removeItem(SESSION_KEY);
    return null;
  } catch {
    return null;
  }
}

export async function registerAccount(
  name: string,
  email: string,
  password: string,
): Promise<{ user?: KurioUser; error?: string }> {
  try {
    const response = await api.post<{ user: KurioUser; token: string }>(
      "/auth/register",
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash: await hashPassword(password),
      },
    );
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        user: response.data.user,
        token: response.data.token,
        expiresAt: Date.now() + 8 * 60 * 60 * 1000,
      }),
    );
    return { user: response.data.user };
  } catch (error: unknown) {
    const message = axios.isAxiosError<{ message?: string }>(error)
      ? error.response?.data?.message
      : undefined;
    return {
      error: message ?? "Não foi possível criar a conta. Tente novamente.",
    };
  }
}

export async function loginAccount(
  email: string,
  password: string,
): Promise<{ user?: KurioUser; error?: string }> {
  try {
    const response = await api.post<{ user: KurioUser; token: string }>(
      "/auth/login",
      {
        email: email.trim().toLowerCase(),
        passwordHash: await hashPassword(password),
      },
    );
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        user: response.data.user,
        token: response.data.token,
        expiresAt: Date.now() + 8 * 60 * 60 * 1000,
      }),
    );
    return { user: response.data.user };
  } catch (error: unknown) {
    const message = axios.isAxiosError<{ message?: string }>(error)
      ? error.response?.data?.message
      : undefined;
    return { error: message ?? "E-mail ou senha incorretos." };
  }
}

export function logoutAccount() {
  const token = getSessionToken();
  if (token)
    void api
      .post(
        "/auth/logout",
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )
      .catch(() => undefined);
  localStorage.removeItem(SESSION_KEY);
}

export function getSessionToken(): string | null {
  try {
    return (
      (
        JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null") as {
          token?: string;
        } | null
      )?.token ?? null
    );
  } catch {
    return null;
  }
}
