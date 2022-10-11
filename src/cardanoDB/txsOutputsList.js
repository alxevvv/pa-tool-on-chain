export async function txsOutputsList(txIds) {
  const url = `${process.env.VUE_APP_POSTGREST_ENDPOINT}/tx_out`;
  const params = new URLSearchParams({
    tx_id: `in.(${txIds.join(",")})`,
    select: "id,address,tx_id,stake_address(id,view)",
  });
  const response = await fetch(`${url}?${params}`);
  const data = await response.json();
  return data;
}
