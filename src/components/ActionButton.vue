<template>
  <WalletConnectButton
    v-if="!walletStore.isConnected"
    size="is-large"
  />

  <FundSelect
    v-else-if="!fundsStore.selectedFundHash"
    size="is-large"
  />

  <RegisterAsPaButton
    v-else-if="fundsStore.isOpenedForRegistration && !fundsStore.isPaRegistered"
    size="is-large"
  />

  <SuggestProposalButton
    v-else-if="fundsStore.isPaRegistered && fundsStore.isOpenedForAssessmentCreation"
    size="is-large"
  />

  <button
    v-else
    disabled
    class="button is-primary is-large"
  >
    No available actions
  </button>
</template>

<script setup>
import FundSelect from "@/components/FundSelect.vue";
import RegisterAsPaButton from "@/components/RegisterAsPaButton.vue";
import SuggestProposalButton from "@/components/SuggestProposalButton.vue";
import WalletConnectButton from "@/components/WalletConnectButton.vue";
import { useWalletStore } from "@/stores/walletStore";
import { useFundsStore } from "@/stores/fundsStore";

const walletStore = useWalletStore();
const fundsStore = useFundsStore();
</script>
