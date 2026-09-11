// n8n Code node — "Build payload"
// Mode: Run Once for All Items
//
// Turns the filtered leads into one ChatGPT Ads Conversions API batch.
// timestamp_ms must be within the last 7 days, so older/missing dates fall back
// to "now".
const events = $input.all().map(item => {
  const l = item.json;
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  let ms = l.created_at ? Date.parse(l.created_at) : now;
  if (!ms || ms < sevenDaysAgo || ms > now) ms = now; // API only allows last 7 days
  return {
    id: String(l.lead_id),
    type: "lead_created",
    timestamp_ms: ms,
    action_source: "offline",
    data: { type: "customer_action" },
  };
});

return [{ json: { payload: {
  validate_only: true, // set to false to record events for real
  integration_source: "n8n-kommo-inside-sales",
  events,
} } }];
