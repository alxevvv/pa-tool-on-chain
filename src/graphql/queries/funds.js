import { getMetadataList } from "./metadata";

export async function getFunds() {
  const metadataList = await getMetadataList();
  return metadataList.filter(({ action }) => action === "fundGenesis");
}
