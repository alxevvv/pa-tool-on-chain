import compactString from "@/utils/compactString";
import { fundActivityPeriod, fundCurrentStages } from "@/utils/fundsUtils";

export function fundFromBlockchain(fundJson) {
  return {
    metadataId: fundJson.id,
    metadataBytes: fundJson.bytes,
    creator: fundJson.json.creator,
    blockTime: fundJson.tx.block.time,
    txId: fundJson.tx_id,
    txHash: fundJson.tx.hash,
    txHashCompact: compactString(fundJson.tx.hash),
    fundHashCompact: compactString(fundJson.json.payload.fundHash),
    activityPeriod: fundActivityPeriod(fundJson.json.payload),
    currentStages: fundCurrentStages(fundJson.json.payload),
    qaStageVerbose: fundJson.json.payload.communityQualityAssuranceStage ? "yes" : "no",
    genesis: fundJson.json.payload,
    ...fundJson.json.payload,
  };
}
