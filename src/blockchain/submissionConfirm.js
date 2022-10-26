import { POSTGREST_API_PATHS } from "./const";
import { apiRequestUrl } from "./dbRequests";

export async function txByHash(txHash) {
  const url = apiRequestUrl(POSTGREST_API_PATHS.tx, {
    hash: `eq.\\x${txHash}`,
  });
  const response = await fetch(url);
  const result = await response.json();
  return result;
}

export async function metadataByTxId(txId) {
  const url = apiRequestUrl(POSTGREST_API_PATHS.metadata, {
    tx_id: `eq.${txId}`,
    select: "*,tx(hash,block(time))",
  });
  const response = await fetch(url);
  const result = await response.json();
  return result;
}
