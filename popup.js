import { fetchUsage, recordError } from "./api.js";

const LABELS = {
  five_hour: "Current session",
  seven_day: "Weekly · all models",
  seven_day_opus: "Weekly · Opus",
  seven_day_sonnet: "Weekly · Sonnet",
  seven_day_oauth_apps: "Weekly · OAuth apps",
};

const content = document.getElementById("content");
const updated = document.getElementById("updated");
const refreshBtn = document.getElementById("refresh");

function prettyKey(key) {
  return LABELS[key] ?? key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

function formatReset(iso) {
  if (!iso) return "";
  const ms = new Date(iso) - Date.now();
  if (ms <= 0) return "Resets now";
  const mins = Math.round(ms / 60000);
  const d = Math.floor(mins / 1440), h = Math.floor((mins % 1440) / 60), m = mins % 60;
  const rel = d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m`;
  const abs = new Date(iso).toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" });
  return `Resets in ${rel} (${abs})`;
}

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
}

function render({ usage, fetchedAt }) {
  content.replaceChildren();
  const limits = Object.entries(usage).filter(([, v]) => v && typeof v.utilization === "number");
  if (limits.length === 0) {
    content.append(el("p", "muted", "No usage limits reported for this account."));
  }
  for (const [key, { utilization, resets_at }] of limits) {
    const pct = Math.min(100, Math.max(0, utilization));
    const block = el("div", "limit");
    const row = el("div", "row");
    row.append(el("span", "label", prettyKey(key)), el("span", "pct", `${Math.round(pct)}%`));
    const bar = el("div", "bar");
    const fill = el("div", `fill ${pct >= 90 ? "bad" : pct >= 70 ? "warn" : ""}`);
    fill.style.width = `${pct}%`;
    bar.append(fill);
    block.append(row, bar, el("div", "muted", formatReset(resets_at)));
    content.append(block);
  }
  updated.textContent = `Updated ${new Date(fetchedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
}

function renderError(message) {
  content.replaceChildren();
  if (message === "NOT_LOGGED_IN") {
    const p = el("p", "error", "You're not logged in to claude.ai. ");
    const a = el("a", null, "Log in");
    a.href = "https://claude.ai/login";
    a.target = "_blank";
    p.append(a);
    content.append(p);
  } else {
    content.append(el("p", "error", `Couldn't load usage: ${message}`));
  }
}

async function refresh() {
  refreshBtn.classList.add("spinning");
  try {
    render(await fetchUsage());
  } catch (err) {
    await recordError(err);
    renderError(err.message);
  } finally {
    refreshBtn.classList.remove("spinning");
  }
}

refreshBtn.addEventListener("click", refresh);

// Show cached data instantly, then refresh in the background.
const { lastUsage } = await chrome.storage.local.get("lastUsage");
if (lastUsage) render(lastUsage);
refresh();
