import sjcl from "sjcl";
import { Web3Storage } from "web3.storage";
import { useRequestsStore } from "@/stores/requestsStore";
import { IPFS_URL, WEB3_STORAGE_ACCESS_TOKEN } from "./const";

export function uploadToIPFS(files, wrapWithDirectory = false) {
  const filesHash = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(files));
  const client = new Web3Storage({ token: WEB3_STORAGE_ACCESS_TOKEN });
  useRequestsStore().sendRequest(
    filesHash,
    (data) => data,
    async () => await client.put(files, { wrapWithDirectory, maxRetries: 1 }),
    (response) => {
      return typeof response !== "string";
    },
    (_, error) => {
      return {
        statusCode: -1,
        statusText: error.data.message,
        ...error,
      };
    },
  );
  return filesHash;
}

export function retreiveFromIPFS(cid) {
  const url = `${IPFS_URL}/${cid}`;
  useRequestsStore().sendRequest(url);
  return url;
}
