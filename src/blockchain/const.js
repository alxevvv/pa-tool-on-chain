export const POSTGREST_API_PATHS = {
  tx: "tx",
  txOut: "tx_out",
  metadata: "tx_metadata",
};

export const BLOCKCHAIN_ACTIONS = {
  fundGenesis: "fundGenesis",
  paRegistration: "paRegistration",
  assessmentsSubmission: "assessmentsSubmission",
  assessmentsPublication: "assessmentsPublication",
  reviewsSubmission: "reviewsSubmission",
  reviewsPublication: "reviewsPublication",
};

export const POSTGREST_API_URL = import.meta.env.VITE_CARDANO_POSTGREST_API_URL;
export const TX_METADATA_KEY = import.meta.env.VITE_CARDANO_TX_METADATA_KEY;
export const TX_METADATA_VERSION = import.meta.env.VITE_CARDANO_TX_METADATA_VERSION;
