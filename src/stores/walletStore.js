import { Address } from "@emurgo/cardano-serialization-lib-asmjs";
import { Buffer } from "buffer";
import pick from "lodash/pick";
import { defineStore } from "pinia";
import { ref, readonly, watch } from "vue";
import { useNotificationsStore } from "@/stores/notificationsStore";
import {
  extractStakeAddress,
  getAvailableWallets,
  getCompatibleWallets,
  getWalletApi,
  getWalletObject,
} from "@/utils/walletUtils";

export const useWalletStore = defineStore(
  "wallet",
  () => {
    const notificationsStore = useNotificationsStore();

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
        // try to get wallet object from window.cardano
        const walletObject = getWalletObject(walletKey);

        // enable wallet
        walletApi = await getWalletApi(walletObject);

        // get wallet props
        const networkId = await walletApi.getNetworkId();
        walletProps.value = {
          ...pick(walletObject, ["name", "icon", "apiVersion"]),
          networkId,
        };

        // get wallet stake address and add it to wallet props
        const unusedAddresses = await walletApi.getUnusedAddresses();
        if (unusedAddresses.length) {
          const unusedAddress = Address.from_bytes(Buffer.from(unusedAddresses[0], "hex")).to_bech32();
          walletProps.value.stakeAddress = extractStakeAddress(unusedAddress, networkId);
        } else {
          walletProps.value.stakeAddress = "";
        }

        // OK
        isConnected.value = true;
      } catch (err) {
        const errorMessage = err.toString();
        connectionError.value = errorMessage;
        notificationsStore.add({
          text: `Wallet connection failed: ${errorMessage}`,
          type: "is-danger",
          duration: 5000,
        });
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
