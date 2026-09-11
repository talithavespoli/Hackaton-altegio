// n8n Code node — "Filter"
// Mode: Run Once for All Items
//
// Merges leads from every status query, optionally keeps only ChatGPT-sourced
// leads (Fonte = "Orgânica"), and dedups by lead id.
//
// While the MCP's query_deals caps results and can't filter by a custom field,
// filtering here under-counts. Set FILTER_BY_FONTE = false to run unfiltered
// (interim), true for the intended behaviour.
const FILTER_BY_FONTE = true;
const TARGET_FONTE = "Orgânica";

const norm = s => (s ?? "").normalize("NFC").trim().toLowerCase();
const target = norm(TARGET_FONTE);

// The MCP returns the list in more than one place and one copy can be truncated;
// use whichever copy is largest.
function findLeads(json) {
  if (!json) return [];
  const sources = [];
  const push = a => { if (Array.isArray(a)) sources.push(a); };
  push(json.structuredContent?.result?.leads);
  push(json.result?.leads);
  push(json.leads);
  let t = json.content?.[0]?.text ?? json.content?.[0];
  if (typeof t === "string") { try { t = JSON.parse(t); } catch (e) { t = null; } }
  push(t?.leads);
  push(t?.result?.leads);
  return sources.sort((a, b) => b.length - a.length)[0] ?? [];
}

let all = [];
for (const item of $input.all()) all = all.concat(findLeads(item.json));

const seen = new Set();
return all
  .filter(l => !FILTER_BY_FONTE || norm(l?.cf?.["Fonte"]) === target)
  .filter(l => !seen.has(l.id) && seen.add(l.id))
  .map(l => ({
    json: {
      lead_id: l.id,
      fonte: l.cf?.["Fonte"] ?? null,
      created_at: l.cf?.["Create date"]
        ? new Date(Number(l.cf["Create date"]) * 1000).toISOString()
        : null,
      responsible: l.responsible ?? null,
    },
  }));
