<template>
  <button
    :class="buttonClasses"
    @click="fundsStore.registerAsPa"
  >
    Register as a PA
  </button>
</template>

<script setup>
import { useWalletStore } from "@/stores/walletStore";
import { useFundsStore } from "@/stores/fundsStore";
import { computed } from "vue";

const props = defineProps({
  size: {
    type: String,
    default: "is-normal",
  },
});

const walletStore = useWalletStore();
const fundsStore = useFundsStore();

const buttonClasses = computed(() => {
  const classes = ["button", "is-primary", props.size];
  if (
    walletStore.isTxSubmitting
    || walletStore.isTxConfirming
    || fundsStore.loadPaRegistrationsRequest?.isLoading
  ) {
    classes.push("is-loading");
  }
  return classes;
});
</script>
