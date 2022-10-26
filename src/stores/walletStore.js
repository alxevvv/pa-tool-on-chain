import pick from "lodash/pick";
import { Buffer } from "buffer";
import { ref, readonly, watch } from "vue";
import { defineStore } from "pinia";
import { Address } from "@emurgo/cardano-serialization-lib-asmjs";
import { useNotificationsStore } from "@/stores/notificationsStore";
import { createMetadataValue } from "@/utils/metadataUtils";
import * as utils from "@/utils/walletUtils";

export const useWalletStore = defineStore(
  "wallet",
  () => {
    const notificationsStore = useNotificationsStore();

    /* wallets availability */

    const compatibleWallets = utils.getCompatibleWallets();
    let availableWallets = [];

    try {
      availableWallets = utils.getAvailableWallets();
    } catch (err) {
      const errorMessage = err.toString();
      if (errorMessage.endsWith("No available wallets found")) {
        notificationsStore.add({
          text: `${errorMessage}.\nInstall one of compatible wallets: ${compatibleWallets.join(", ")}`,
          type: "is-warning",
          duration: 5000,
        });
      } else {
        throw err;
      }
    }

    /* connect/disconnect wallet */

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
        const walletObject = utils.getWalletObject(walletKey);

        // enable wallet
        walletApi = await utils.getWalletApi(walletObject);

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
          walletProps.value.stakeAddress = utils.extractStakeAddress(unusedAddress, networkId);
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

    /* map utils */

    async function getWalletUtxos() {
      return await utils.getWalletUtxos(walletApi);
    }

    async function getWalletRecipientAddress() {
      return await utils.getWalletRecipientAddress(walletApi);
    }

    async function getWalletChangeAddress() {
      return await utils.getWalletChangeAddress(walletApi);
    }

    async function signTx(tx, transactionWitnessSet) {
      return await utils.signTx(walletApi, tx, transactionWitnessSet);
    }

    async function submitTx(txCbor) {
      return await utils.submitTx(walletApi, txCbor);
    }

    /* transaction sending */

    async function submitMetadataTx(action, payload) {
      if (!walletProps.value.stakeAddress) {
        throw new Error("No wallet stake address");
      }

      const recipientAddress = await getWalletRecipientAddress();
      const changeAddress = await getWalletChangeAddress();
      const utxos = await getWalletUtxos();
      const metadataValue = createMetadataValue(action, payload, walletProps.value.stakeAddress);

      const { tx, transactionWitnessSet } = utils.buildTx(recipientAddress, changeAddress, utxos, {
        metadataValue,
      });
      const signedTx = await signTx(tx, transactionWitnessSet);
      const txCbor = utils.getTxCbor(signedTx);

      await submitTx(txCbor);
    }

    /* handle selected wallet key change */

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
      submitMetadataTx,
    };
  },
  {
    persist: {
      paths: ["selectedWalletKey"],
    },
  },
);
