import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

const SERVER_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-20f51e2c`;

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchCart(): Promise<any[]> {
  const headers = await authHeaders();
  const res = await fetch(`${SERVER_BASE}/cart`, { headers });
  if (!res.ok) return [];
  const json = await res.json();
  return json.items ?? [];
}

export async function saveCart(items: any[]): Promise<void> {
  const headers = await authHeaders();
  await fetch(`${SERVER_BASE}/cart`, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
}

export async function fetchWishlist(): Promise<any[]> {
  const headers = await authHeaders();
  const res = await fetch(`${SERVER_BASE}/wishlist`, { headers });
  if (!res.ok) return [];
  const json = await res.json();
  return json.items ?? [];
}

export async function saveWishlist(items: any[]): Promise<void> {
  const headers = await authHeaders();
  await fetch(`${SERVER_BASE}/wishlist`, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
}
