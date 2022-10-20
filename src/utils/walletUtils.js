import { Address, BaseAddress, RewardAddress } from "@emurgo/cardano-serialization-lib-asmjs";

function getCardanoWalletsObject() {
  const wallets = window.cardano;
  if (wallets) {
    return wallets;
  } else {
    throw new Error("No available wallets found");
  }
}

export function getCompatibleWallets() {
  return import.meta.env.VITE_COMPATIBLE_WALLETS.split(",").map((key) => key.trim());
}

export function getAvailableWallets() {
  const compatibleWallets = getCompatibleWallets();
  return Object.keys(getCardanoWalletsObject()).filter((walletKey) => compatibleWallets.includes(walletKey));
}

export function getWalletObject(walletKey) {
  const wallets = getCardanoWalletsObject();
  if (!wallets[walletKey]) {
    throw new Error(`Wallet "${walletKey}" is not in "window" object`);
  }
  return wallets[walletKey];
}

export async function getWalletApi(walletObject) {
  return await walletObject.enable();
}

export function extractStakeAddress(addressBech32, networkId = 1) {
  const addr = Address.from_bech32(addressBech32);
  const baseAddr = BaseAddress.from_address(addr);
  const stakeCred = baseAddr.stake_cred();
  const rewardAddrBytes = new Uint8Array(29);
  rewardAddrBytes.set([networkId === 1 ? 0xe1 : 0xe0], 0);
  rewardAddrBytes.set(stakeCred.to_bytes().slice(4, 32), 1);
  const rewardAddr = RewardAddress.from_address(Address.from_bytes(rewardAddrBytes));
  return rewardAddr.to_address().to_bech32();
}
