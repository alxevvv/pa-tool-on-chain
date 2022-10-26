import { TX_METADATA_VERSION } from "@/blockchain/const";

const defaultCreateMetadataJsonOptions = {
  version: TX_METADATA_VERSION,
};

export function createMetadataValue(action, payload, creator, options = {}) {
  const opts = {
    ...defaultCreateMetadataJsonOptions,
    ...options,
  };

  return {
    action,
    creator,
    version: opts.version,
    payload,
  };
}
