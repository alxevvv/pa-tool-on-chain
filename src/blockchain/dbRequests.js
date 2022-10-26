import { useRequestsStore } from "@/stores/requestsStore";
import {
  BLOCKCHAIN_ACTIONS,
  POSTGREST_API_PATHS,
  POSTGREST_API_URL,
  TX_METADATA_KEY,
  TX_METADATA_VERSION,
} from "./const";

function apiRequestUrl(path, params = {}) {
  return `${POSTGREST_API_URL}/${path}?${new URLSearchParams(params)}`;
}

function apiSelectMetadataUrl(action, params = {}) {
  return apiRequestUrl(POSTGREST_API_PATHS.metadata, {
    key: `eq.${TX_METADATA_KEY}`,
    "json->>version": `eq.${TX_METADATA_VERSION}`,
    "json->>action": `eq.${action}`,
    select: "*,tx(hash,block(time))",
    ...params,
  });
}

function apiSelectMetadataFundUrl(action, fundHash, params = {}) {
  return apiSelectMetadataUrl(action, {
    "json->payload->>fundHash": `eq.${fundHash}`,
    ...params,
  });
}

export function fundsList() {
  const url = apiSelectMetadataUrl(BLOCKCHAIN_ACTIONS.fundGenesis);
  useRequestsStore().sendRequest(url);
  return url;
}

export function paRegistrationsList(fundHash, stakeAddress) {
  const params = stakeAddress ? { "json->>creator": `eq.${stakeAddress}` } : {};
  const url = apiSelectMetadataFundUrl(BLOCKCHAIN_ACTIONS.paRegistration, fundHash, params);
  useRequestsStore().sendRequest(url);
  return url;
}
