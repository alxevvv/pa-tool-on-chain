<template>
  <span v-if="fundsStore.qaDisabledFundHashes.includes(props.fundHash)">
    No QA Fund
  </span>

  <span v-else-if="!isConnected">
    <span class="tag is-warning">
      Wallet not connected

    </span>
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
    <span class="tag is-success">
      Registered <span v-if="props.withTime">at {{ registeredAt }}</span>
    </span>
  </span>

  <span v-else>
    Not registered
  </span>
</template>

<script setup>
import dayjs from "dayjs";
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useFundsStore } from "@/stores/fundsStore";
import { useWalletStore } from "@/stores/walletStore";

const props = defineProps({
  fundHash: {
    type: String,
    required: true,
  },
  withTime: {
    type: Boolean,
    default: false,
  },
});

const fundsStore = useFundsStore();
const walletStore = useWalletStore();

const { loadPaRegistrationsRequest } = storeToRefs(fundsStore);
const { isConnected } = storeToRefs(walletStore);

const registeredAt = computed(() => {
  if (!fundsStore.paRegistration) {
    return "";
  } else {
    return dayjs(fundsStore.paRegistration.blockTime).format("DD.MM.YYYY, HH:mm");
  }
});
</script>
