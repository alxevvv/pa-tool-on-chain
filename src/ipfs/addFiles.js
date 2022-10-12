import { Web3Storage } from "web3.storage/dist/bundle.esm.min.js";

async function uploadToIPFS(files, wrapWithDirectory = false) {
  const client = new Web3Storage({ token: process.env.VUE_APP_WEB3_STORAGE_ACCESS_TOKEN });
  const cid = await client.put(files, { wrapWithDirectory });
  return cid;
}

export default uploadToIPFS;
