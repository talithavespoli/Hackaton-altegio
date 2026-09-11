# n8n workflow setup

Node order:

**Schedule Trigger → Statuses → query_deals (MCP Client) → Filter → Build payload → HTTP Request**

## Schedule Trigger
- Trigger interval: Minutes (e.g. every 10).
- Keep it **off** until the Remove Duplicates node is added, or every run re-counts
  the same leads.

## Statuses (Code)
- Mode: Run Once for All Items
- Code: [`01-statuses.js`](01-statuses.js)

## query_deals (MCP Client)
- Server Transport: **HTTP Streamable**
- MCP Endpoint URL: `https://mcp.alteg.io/kommo/br/mcp`
- Authentication: **Bearer Auth** → credential holds the Kommo MCP machine token
- Tool: `query_deals`
- Input Mode: Manual
- Parameters:
  - Pipeline Name: `Inside Sales`
  - Status Name: `{{ $json.statusName }}` (Expression — comes from the Statuses node)
  - Mode: `list`
  - Include Closed: **on**
- Options → Timeout: ~`200000` ms (large stages are slow)

## Filter (Code)
- Mode: Run Once for All Items
- Code: [`02-filter.js`](02-filter.js)

## Build payload (Code)
- Mode: Run Once for All Items
- Code: [`03-build-payload.js`](03-build-payload.js)

## HTTP Request (send to ChatGPT Ads)
- Method: **POST**
- URL: `https://bzr.openai.com/v1/events?pid=<KOMMO_LEAD_PIXEL_ID>`
- Authentication: Generic Credential Type → **Bearer Auth** → credential holds the
  Conversions API key
- Send Body: **on**
- Body Content Type: **JSON**
- Specify Body: **Using JSON**
- JSON: `{{ $json.payload }}`

## Going live
1. Confirm the response shows `accepted_events` = your lead count (with
   `validate_only: true`).
2. Set `validate_only: false` in the Build payload node.
3. Add a **Remove Duplicates** node (key: `lead_id`, "remove items seen in previous
   executions") before the HTTP Request.
4. Enable the Schedule Trigger.
