import compactString from "@/utils/compactString";
import { fundActivityPeriod, fundCurrentStages } from "@/utils/fundsUtils";

function metadataFromBlockchain(metadata) {
  return {
    metadataId: metadata.id,
    metadataBytes: metadata.bytes,
    creator: metadata.json.creator,
    blockTime: metadata.tx.block.time,
    txId: metadata.tx_id,
    txHash: metadata.tx.hash,
    txHashCompact: compactString(metadata.tx.hash),
    ...metadata.json.payload,
  };
}

export function fundFromBlockchain(metadata) {
  return {
    ...metadataFromBlockchain(metadata),
    fundHashCompact: compactString(metadata.json.payload.fundHash),
    activityPeriod: fundActivityPeriod(metadata.json.payload),
    currentStages: fundCurrentStages(metadata.json.payload),
    qaStageVerbose: metadata.json.payload.communityQualityAssuranceStage ? "yes" : "no",
    genesis: metadata.json.payload,
  };
}

export function paRegistrationFromBlockchain(metadata) {
  return {
    ...metadataFromBlockchain(metadata),
  };
}
