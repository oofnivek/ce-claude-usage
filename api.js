import { setIcon } from "./icon.js";

const BASE = "https://claude.ai";

async function getJson(path) {
  const res = await fetch(BASE + path, { credentials: "include", headers: { accept: "application/json" } });
  if (res.status === 401 || res.status === 403) throw new Error("NOT_LOGGED_IN");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Prefer the org the website last used (lastActiveOrg cookie), else the first chat-capable org.
async function getOrgId() {
  const cookie = await chrome.cookies.get({ url: BASE, name: "lastActiveOrg" }).catch(() => null);
  if (cookie?.value) return cookie.value;
  const orgs = await getJson("/api/organizations");
  if (!Array.isArray(orgs) || orgs.length === 0) throw new Error("NOT_LOGGED_IN");
  const chatOrg = orgs.find((o) => o.capabilities?.includes("chat")) ?? orgs[0];
  return chatOrg.uuid;
}

export async function fetchUsage() {
  const orgId = await getOrgId();
  const usage = await getJson(`/api/organizations/${orgId}/usage`);
  const data = { usage, fetchedAt: Date.now() };
  await chrome.storage.local.set({ lastUsage: data, lastError: null });
  await updateBadge(usage);
  return data;
}

export async function updateBadge(usage) {
  const pct = usage?.five_hour?.utilization;
  await chrome.action.setBadgeText({ text: "" });
  await setIcon(typeof pct === "number" ? `${Math.round(pct)}` : "");
}

export async function recordError(err) {
  await chrome.storage.local.set({ lastError: String(err?.message ?? err) });
  await chrome.action.setBadgeText({ text: "" });
  await setIcon("!");
}
