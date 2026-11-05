// ================= SETTINGS (the only part you edit) =================
// Leave both empty to run in DEMO mode (cards open each app's own search).
// To get real video results, deploy the Supabase "search" function and paste:
const SEARCH_ENDPOINT = ""; // e.g. "https://yourproject.supabase.co/functions/v1/search"
const SUPABASE_ANON_KEY = ""; // Supabase > Project Settings > API > "anon public" key (safe to be public)
// NEVER put YouTube / Brave / Anthropic keys in this file. They live in Supabase only.
// =====================================================================

const PLATFORMS = {
  youtube:   { name: "YouTube",   pkg: "com.google.android.youtube", search: q => `https://www.youtube.com/results?search_query=${q}` },
  tiktok:    { name: "TikTok",    pkg: "com.zhiliaoapp.musically",   search: q => `https://www.tiktok.com/search?q=${q}` },
  instagram: { name: "Instagram", pkg: "com.instagram.android",      search: q => `https://www.instagram.com/explore/search/keyword/?q=${q}` }
};
const EXAMPLES = ["marlon zyro slowed edits", "calm lofi rainy city aesthetic", "sad anime edit slowed reverb", "hype gym montage phonk"];
const STYLES = ["edit", "edits", "slowed", "reverb", "sped up", "reel", "short", "compilation", "highlights", "montage", "meme", "amv", "tribute", "remix", "phonk"];
const MOODS = ["calm", "chill", "hype", "sad", "nostalgic", "aesthetic", "funny", "cozy", "epic", "dark", "wholesome", "relaxing"];

const $ = id => document.getElementById(id);

// ---- Understand the request (simple version; the Supabase function uses Claude for this) ----
function understand(text) {
  const lower = text.toLowerCase();
  const has = w => new RegExp("\\b" + w + "\\b").test(lower);
  const audioMatch = text.match(/(?:song|track|audio|sound|ft\.?|feat\.?)\s+["“]?([^"”]+)/i);
  return {
    styles: STYLES.filter(has),
    moods: MOODS.filter(has),
    audio: audioMatch ? audioMatch[1].trim() : ""
  };
}

// ---- Demo results: each card hands off to that app's own search ----
function demoResults(text, info) {
  const variants = {
    youtube:   [["Short", " shorts"], ["Long video", ""]],
    tiktok:    [["Short clip", ""], ["Short clip", " edit"]],
    instagram: [["Reel", " reel"], ["Reel", ""]]
  };
  const out = [];
  Object.keys(variants).forEach(p => variants[p].forEach(([format, extra]) => {
    const q = (text + extra).trim();
    out.push({
      platform: p, format, title: q,
      audio: info.audio || (info.moods[0] ? info.moods[0] + " vibe" : "Original audio"),
      why: "Opens " + PLATFORMS[p].name + " search for this exact phrasing",
      url: PLATFORMS[p].search(encodeURIComponent(q))
    });
  }));
  return out;
}

// ---- Live results from your Supabase function ----
async function liveResults(text) {
  const res = await fetch(SEARCH_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + SUPABASE_ANON_KEY, "apikey": SUPABASE_ANON_KEY },
    body: JSON.stringify({ query: text })
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || "Search failed");
  return (data.results || []).filter(r => typeof r.url === "string" && r.url.startsWith("https://") && PLATFORMS[r.platform]);
}

// ---- One-tap handoff into the native app (falls back to the web page) ----
function openInApp(e, url, platform) {
  const ua = navigator.userAgent;
  const android = /Android/i.test(ua), ios = /iPhone|iPad|iPod/i.test(ua);
  e.preventDefault();
  if (!android && !ios) { window.open(url, "_blank", "noopener"); return; }
  if (android) {
    const u = new URL(url);
    window.location.href = `intent://${u.host}${u.pathname}${u.search}#Intent;scheme=https;package=${PLATFORMS[platform].pkg};S.browser_fallback_url=${encodeURIComponent(url)};end`;
    return;
  }
  window.location.href = url; // iOS universal link: opens the app if installed, otherwise the web page
}

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = $("searchInput"), searchBtn = $("searchBtn"), clearBtn = $("clearBtn");
  const resultsGrid = $("resultsGrid"), searchTitle = $("searchTitle");
  let results = [], filter = "all";

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text; // textContent keeps web-sourced text safe
    return n;
  }

  function makeCard(r) {
    const a = el("a", "card");
    a.href = r.url; a.target = "_blank"; a.rel = "noopener";
    a.addEventListener("click", e => openInApp(e, r.url, r.platform));
    const thumb = el("div", "thumb");
    if (typeof r.thumb === "string" && r.thumb.startsWith("https://")) {
      const img = el("img"); img.src = r.thumb; img.alt = ""; img.loading = "lazy"; thumb.appendChild(img);
    } else thumb.appendChild(el("span", "", "▶"));
    thumb.appendChild(el("span", "badge", PLATFORMS[r.platform].name));
    const info = el("div", "info");
    info.appendChild(el("p", "title", r.title || "Untitled"));
    if (r.why) info.appendChild(el("p", "why", r.why));
    const tags = el("div", "tags");
    if (r.format) tags.appendChild(el("span", "", r.format));
    tags.appendChild(el("span", "", "♪ " + (r.audio || "Audio unknown")));
    info.appendChild(tags);
    info.appendChild(el("div", "open", "Open in " + PLATFORMS[r.platform].name + " →"));
    a.append(thumb, info);
    return a;
  }

  function renderResults() {
    resultsGrid.replaceChildren();
    results.filter(r => filter === "all" || r.platform === filter).forEach(r => resultsGrid.appendChild(makeCard(r)));
  }

  function renderFilters() {
    const f = $("filters"); f.replaceChildren();
    [["all", "All"], ["youtube", "YouTube"], ["tiktok", "TikTok"], ["instagram", "Instagram"]].forEach(([key, label]) => {
      const b = el("button", key === filter ? "on" : "", label);
      b.addEventListener("click", () => { filter = key; renderFilters(); renderResults(); });
      f.appendChild(b);
    });
  }

  function renderUnderstood(info) {
    const box = $("understood"); box.replaceChildren();
    [["Style", info.styles.join(", ")], ["Mood", info.moods.join(", ")], ["Audio", info.audio]].forEach(([k, v]) => {
      if (!v) return;
      const c = el("span", "chip", k + " "); c.appendChild(el("b", "", v)); box.appendChild(c);
    });
  }

  function resetView() {
    $("resultsSection").hidden = true; $("app").classList.remove("searched");
    $("examples").hidden = false; $("status").textContent = "";
  }

  async function runSearch(raw) {
    const text = raw.trim();
    if (!text) return;
    searchInput.value = text; clearBtn.classList.add("visible");
    $("app").classList.add("searched"); $("examples").hidden = true;
    $("resultsSection").hidden = false; filter = "all";
    searchTitle.textContent = "Results for “" + text + "”";
    resultsGrid.replaceChildren(); $("status").textContent = "Searching…";
    const info = understand(text);
    renderUnderstood(info); renderFilters();
    try {
      if (SEARCH_ENDPOINT) {
        results = await liveResults(text);
        $("status").textContent = results.length ? "" : "No close matches found. Try describing it differently.";
      } else {
        results = demoResults(text, info);
        $("status").textContent = "Demo mode: cards open each app’s own search. Add your Supabase address in script.js for exact videos.";
      }
    } catch (err) {
      results = []; $("status").textContent = "Something went wrong with the search. Please try again.";
    }
    renderResults();
  }

  searchInput.addEventListener("input", () => clearBtn.classList.toggle("visible", searchInput.value.trim().length > 0));
  clearBtn.addEventListener("click", () => { searchInput.value = ""; clearBtn.classList.remove("visible"); searchInput.focus(); resetView(); });
  searchBtn.addEventListener("click", () => runSearch(searchInput.value));
  searchInput.addEventListener("keydown", e => { if (e.key === "Enter") runSearch(searchInput.value); });
  EXAMPLES.forEach(t => { const b = el("button", "", t); b.addEventListener("click", () => runSearch(t)); $("examples").appendChild(b); });
});
