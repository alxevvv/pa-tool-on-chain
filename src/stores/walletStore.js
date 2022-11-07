import pick from "lodash/pick";
import { v4 as uuidv4 } from "uuid";
import { Buffer } from "buffer";
import { ref, readonly, watch, reactive, computed } from "vue";
import { defineStore } from "pinia";
import { Address } from "@emurgo/cardano-serialization-lib-asmjs";
import { metadataByTxId, txByHash } from "@/blockchain/submissionConfirm";
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

    const isProcessing = computed(() => {
      return isConnecting.value || isTxSubmitting.value || isTxConfirming.value;
    });

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

    /* transaction submission */

    const submissions = reactive({});
    const isTxSubmitting = ref(false);
    const isTxConfirming = ref(false);

    function onBeforeSubmission(uuid) {
      isTxSubmitting.value = true;
      submissions[uuid] = {
        uuid,
        startedAt: Date.now(),
        isProcessing: true,
        isConfirmed: false,
      };
    }

    function onAfterSubmission(uuid, errorMessage, txHash) {
      Object.assign(submissions[uuid], {
        finishedAt: Date.now(),
        isProcessing: false,
        isSuccess: !errorMessage,
        isFailed: !!errorMessage,
        errorMessage,
        txHash,
      });
      isTxSubmitting.value = false;
      if (!errorMessage) {
        notificationsStore.add({
          type: "is-info",
          text: [
            `Transaction submission successfull, hash: ${txHash}.`,
            "Awaiting blockchain confirmation. You can safely leave this page.",
          ],
          duration: 30000,
        });
      }
    }

    function onAfterConfirmation(uuid, confirmedMetadata) {
      Object.assign(submissions[uuid], {
        confirmedAt: Date.now(),
        isConfirmed: true,
        confirmedMetadata,
      });
      isTxConfirming.value = false;
      notificationsStore.add({
        type: "is-success",
        text: `Transaction ${submissions[uuid].txHash} submission confirmed`,
        duration: 3000,
      });
    }

    function onConfirmationTimeout(uuid) {
      isTxConfirming.value = false;
      notificationsStore.add({
        type: "is-warning",
        text: `Unable to confirm transaction ${submissions[uuid].txHash}`,
        duration: 5000,
      });
    }

    function watchForSubmissionConfirmation(uuid, txHash, onSuccess) {
      let attemptsCount = 0;
      let txId = null;
      let confirmedMetadata = null;
      let isLoading = false;

      isTxConfirming.value = true;

      const intervalId = setInterval(async () => {
        if (isLoading) {
          return;
        }

        if (attemptsCount >= 100) {
          clearInterval(intervalId);
          onConfirmationTimeout(uuid);
        }

        isLoading = true;
        attemptsCount += 1;

        if (!txId) {
          const txByHashResult = await txByHash(txHash);
          if (txByHashResult && txByHashResult.length) {
            const tx = txByHashResult[0];
            if (tx && tx.id) {
              txId = tx.id;
            }
          }
        }

        if (txId) {
          const metadataResult = await metadataByTxId(txId);
          if (metadataResult && metadataResult.length) {
            const metadata = metadataResult[0];
            if (metadata && metadata.tx_id === txId) {
              confirmedMetadata = metadata;
            }
          }
        }

        if (confirmedMetadata) {
          clearInterval(intervalId);
          onAfterConfirmation(uuid, confirmedMetadata);

          if (typeof onSuccess === "function") {
            onSuccess({
              confirmedMetadata,
              txHash,
              submissionUuid: uuid,
            });
          }
        }

        isLoading = false;
      }, 5000);
    }

    async function submitMetadataTx(action, payload, onSuccess) {
      if (!walletApi) {
        throw new Error("No wallet API connected");
      }
      if (!walletProps.value.stakeAddress) {
        throw new Error("No wallet stake address");
      }

      function onError(err) {
        onAfterSubmission(submissionUuid, err.toString(), null);
        notificationsStore.add({
          text: err.toString(),
          type: "is-danger",
          duration: 5000,
        });
      }

      let signedTx;
      let txHash;

      const submissionUuid = uuidv4();

      onBeforeSubmission(submissionUuid);

      const recipientAddress = await getWalletRecipientAddress();
      const changeAddress = await getWalletChangeAddress();
      const utxos = await getWalletUtxos();
      const metadataValue = createMetadataValue(action, payload, walletProps.value.stakeAddress);

      const { tx, transactionWitnessSet } = utils.buildTx(recipientAddress, changeAddress, utxos, {
        metadataValue,
      });

      try {
        signedTx = await signTx(tx, transactionWitnessSet);
      } catch (err) {
        onError(err);
        return;
      }

      const txCbor = utils.getTxCbor(signedTx);

      try {
        txHash = await submitTx(txCbor);
      } catch (err) {
        onError(err);
        return;
      }

      onAfterSubmission(submissionUuid, null, txHash);
      watchForSubmissionConfirmation(submissionUuid, txHash, onSuccess);

      return submissionUuid;
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
      isProcessing,

      submissions: readonly(submissions),
      isTxSubmitting: readonly(isTxSubmitting),
      isTxConfirming: readonly(isTxConfirming),

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
