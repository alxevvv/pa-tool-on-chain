<template>
  <WalletConnectButton
    v-if="!walletStore.isConnected"
    size="is-large"
  />

  <FundSelect
    v-else-if="!fundsStore.selectedFundHash"
    size="large"
  />

  <button
    v-else-if="fundsStore.isOpenedForRegistration && !fundsStore.isPaRegistered"
    class="button is-primary is-large"
    @click="fundsStore.testTx"
  >
    Register as a PA
  </button>

  <button
    v-else-if="fundsStore.isPaRegistered && fundsStore.isOpenedForAssessmentCreation"
    class="button is-primary is-large"
  >
    Suggest Proposal
  </button>

  <button
    v-else
    disabled
    class="button is-primary is-large"
  >
    No available actions
  </button>
</template>

<script setup>
import { useWalletStore } from "@/stores/walletStore";
import { useFundsStore } from "@/stores/fundsStore";
import FundSelect from "@/components/FundSelect.vue";
import WalletConnectButton from "@/components/WalletConnectButton.vue";

const walletStore = useWalletStore();
const fundsStore = useFundsStore();
</script>
