// n8n Code node — "Statuses"
// Mode: Run Once for All Items
//
// query_deals only scopes reliably by *status* (pipeline-name alone is ignored),
// so we emit one item per Inside Sales stage and query each, then merge downstream.
return [
  "Closed - Won",
  "Closed - Lost",
  "Potencial / cold",
  "Avançado / warm",
  "Em espera",
  "Resposta do Funil",
  "Contato",
].map(s => ({ json: { statusName: s } }));
