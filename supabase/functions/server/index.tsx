import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use('*', logger(console.log));

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

app.get("/make-server-20f51e2c/health", (c) => {
  return c.json({ status: "ok" });
});

async function getUserId(c: any): Promise<string | null> {
  const auth = c.req.header("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL"),
    Deno.env.get("SUPABASE_ANON_KEY"),
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

// Cart endpoints
app.get("/make-server-20f51e2c/cart", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);
  const items = await kv.get(`cart:${userId}`) ?? [];
  return c.json({ items });
});

app.put("/make-server-20f51e2c/cart", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);
  const body = await c.req.json();
  await kv.set(`cart:${userId}`, body.items ?? []);
  return c.json({ ok: true });
});

// Wishlist endpoints
app.get("/make-server-20f51e2c/wishlist", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);
  const items = await kv.get(`wishlist:${userId}`) ?? [];
  return c.json({ items });
});

app.put("/make-server-20f51e2c/wishlist", async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);
  const body = await c.req.json();
  await kv.set(`wishlist:${userId}`, body.items ?? []);
  return c.json({ ok: true });
});

Deno.serve(app.fetch);
