import { useRequestsStore } from "@/stores/requestsStore";

const URLS = {
  metadata: "tx_metadata",
  txOut: "tx_out",
};

const ACTIONS = {
  fundGenesis: "fundGenesis",
  registerPA: "registerPA",
  assessmentsSubmission: "assessmentsSubmission",
  assessmentsPublication: "assessmentsPublication",
  reviewsSubmission: "reviewsSubmission",
  reviewsPublication: "reviewsPublication",
};

const POSTGREST_API_URL = import.meta.env.VITE_CARDANO_POSTGREST_API_URL;
const TX_METADATA_KEY = import.meta.env.VITE_CARDANO_TX_METADATA_KEY;
// const TX_METADATA_VERSION = import.meta.env.VITE_CARDANO_TX_METADATA_VERSION;

function apiRequestUrl(path, params = {}) {
  return `${POSTGREST_API_URL}/${path}?${new URLSearchParams(params)}`;
}

function apiSelectMetadataUrl(action, params = {}) {
  return apiRequestUrl(URLS.metadata, {
    key: `eq.${TX_METADATA_KEY}`,
    // version: `eq.${TX_METADATA_VERSION}`,
    "json->>action": `eq.${action}`,
    select: "*,tx(hash,block(time))",
    ...params,
  });
}

// function apiSelectFundMetadataUrl(action, fundHash, params = {}) {
//   return apiSelectMetadataUrl(action, {
//     "json->>fundHash": `eq.${fundHash}`,
//     ...params,
//   });
// }

export function fundsList() {
  const url = apiSelectMetadataUrl(ACTIONS.fundGenesis);
  useRequestsStore().sendRequest(url);
  return url;
}

// async function paRegistrations(fundHash) {
//   const url = this.apiUrlFundMetadata(URLS.paRegistrations, ACTIONS.registerPA, fundHash);
//   return await await this.fetch(url);
// }
