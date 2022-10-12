async function retreiveFromIPFS(cid) {
  return await fetch(`${process.env.VUE_APP_IPFS_URL}/${cid}`);
}

export default retreiveFromIPFS;
