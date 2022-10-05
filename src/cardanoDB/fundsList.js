export async function fundsList() {
  const url = `${process.env.VUE_APP_POSTGREST_ENDPOINT}/tx_metadata`;
  const params = new URLSearchParams({
    key: `eq.${process.env.VUE_APP_METADATA_KEY}`,
    "json->>action": "eq.fundGenesis",
  });
  const response = await fetch(`${url}?${params}`);
  const data = await response.json();
  return data;
}
