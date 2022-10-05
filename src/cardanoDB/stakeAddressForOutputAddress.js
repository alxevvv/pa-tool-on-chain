export async function stakeAddressForOutputAddress(addressBech32) {
  const url = `${process.env.VUE_APP_POSTGREST_ENDPOINT}/tx_out`;
  const params = new URLSearchParams({
    address: `eq.${addressBech32}`,
    select: "stake_address(id,view)",
  });
  const response = await fetch(`${url}?${params}`);
  const data = await response.json();
  if (data.length && data[0].stake_address) {
    return data[0].stake_address.view;
  } else {
    return null;
  }
}
