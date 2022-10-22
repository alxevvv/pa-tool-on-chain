import compactString from "@/utils/compactString";

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
    ...fundJson.json.payload,
  };
}
