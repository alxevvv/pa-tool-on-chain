<template>
  <WalletConnectButton
    v-if="!walletStore.isConnected"
    size="is-large"
  />
  <button
    v-else
    class="button is-primary is-large"
  >
    Suggest Proposal
  </button>
</template>

<script setup>
import { useWalletStore } from "@/stores/walletStore";
import WalletConnectButton from "@/components/WalletConnectButton.vue";

const walletStore = useWalletStore();
</script>
