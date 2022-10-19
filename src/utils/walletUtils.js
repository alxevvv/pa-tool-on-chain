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
