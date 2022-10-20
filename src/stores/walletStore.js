import pick from "lodash/pick";
import { defineStore } from "pinia";
import { ref, readonly, watch } from "vue";
import {
  getAvailableWallets,
  getCompatibleWallets,
  getWalletApi,
  getWalletObject,
} from "../utils/walletUtils";

export const useWalletStore = defineStore(
  "wallet",
  () => {
    /*
      wallets availability
    */

    const compatibleWallets = getCompatibleWallets();
    const availableWallets = getAvailableWallets();

    /*
      connect/disconnect wallet
    */

    const isConnecting = ref(false);
    const isConnected = ref(false);
    const selectedWalletKey = ref("");
    const connectionError = ref("");
    const walletProps = ref({});
    let walletApi = null;

    function selectWallet(walletKey) {
      if (walletKey === "" || compatibleWallets.includes(walletKey)) {
        selectedWalletKey.value = walletKey;
      } else {
        throw new Error(`Wallet "${walletKey}" is not compatible`);
      }
    }

    async function connectWallet(walletKey) {
      isConnecting.value = true;
      connectionError.value = "";
      try {
        const walletObject = getWalletObject(walletKey);
        walletApi = await getWalletApi(walletObject);
        walletProps.value = {
          ...pick(walletObject, ["name", "icon", "apiVersion"]),
          networkId: await walletApi.getNetworkId(),
        };
        isConnected.value = true;
      } catch (err) {
        connectionError.value = err.toString();
        selectedWalletKey.value = "";
      } finally {
        isConnecting.value = false;
      }
    }

    function disconnectWallet() {
      walletApi = null;
      walletProps.value = {};
      isConnected.value = false;
    }

    function updateWalletConnection(walletKey) {
      if (isConnecting.value) {
        return;
      }
      if (walletKey) {
        connectWallet(walletKey);
      } else {
        disconnectWallet();
      }
    }

    watch(selectedWalletKey, updateWalletConnection, { immediate: true });

    /*  */

    return {
      availableWallets: readonly(availableWallets),
      compatibleWallets: readonly(compatibleWallets),

      isConnecting: readonly(isConnecting),
      isConnected: readonly(isConnected),
      connectionError: readonly(connectionError),
      walletProps: readonly(walletProps),
      selectedWalletKey,
      selectWallet,
      updateWalletConnection,
    };
  },
  {
    persist: {
      paths: ["selectedWalletKey"],
    },
  },
);

// TODO: Wallet connection error UI handler
