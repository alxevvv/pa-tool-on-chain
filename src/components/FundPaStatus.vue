<template>
  <span v-if="fundsStore.qaDisabledFundHashes.includes(props.fundHash)">
    No QA Fund
  </span>

  <span v-else-if="!isConnected">
    Wallet not connected
  </span>

  <span v-else-if="!fundsStore.openedForPaRegistrationFundHashes.includes(props.fundHash)">
    Registration is closed
  </span>

  <span v-else-if="loadPaRegistrationsRequest?.request?.isLoading">
    Loading...
  </span>

  <span v-else-if="loadPaRegistrationsRequest?.request?.isFailed">
    Error
  </span>

  <span v-else-if="fundsStore.paRegisteredFundHashes.includes(props.fundHash)">
    Registered
  </span>

  <span v-else>
    Not registered
  </span>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useFundsStore } from "@/stores/fundsStore";
import { useWalletStore } from "@/stores/walletStore";

const props = defineProps({
  fundHash: {
    type: String,
    required: true,
  },
});

const fundsStore = useFundsStore();
const walletStore = useWalletStore();

const { loadPaRegistrationsRequest } = storeToRefs(fundsStore);
const { isConnected } = storeToRefs(walletStore);
</script>
